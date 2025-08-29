import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import pool from '../lib/db.js';

async function backupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('💾 Creating database backup...');
    
    // Call PostgreSQL function
    const result = await client.query('SELECT get_all_table_data() AS backup_data');
    const backupData = result.rows[0].backup_data;

    // Write to JSON file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.json`;
    
    await fs.writeFile(filename, JSON.stringify(backupData, null, 2));
    
    console.log(`✅ Backup created: ${filename}`);
    console.log(`📊 Tables backed up: ${Object.keys(backupData).length}`);
    
    return filename;
    
  } catch (error) {
    console.error('❌ Backup error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function listBackups() {
  try {
    const files = await fs.readdir('.');
    const backupFiles = files
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .sort()
      .reverse(); // Most recent first
    
    console.log('📂 Available backups:');
    backupFiles.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file}`);
    });
    
    return backupFiles;
  } catch (error) {
    console.error('❌ Error listing backups:', error);
    return [];
  }
}

async function restoreFromBackup(backupFilename = null) {
  const client = await pool.connect();
  
  try {
    let backupFile = backupFilename;
    
    // If no filename provided, show interactive selection
    if (!backupFile) {
      const backups = await listBackups();
      if (backups.length === 0) {
        console.log('❌ No backup files found');
        return;
      }
      
      // Show available backups
      console.log('\n📂 Available backups:');
      backups.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file}`);
      });
      
      // Interactive selection
      const readline = (await import('readline')).createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      try {
        const answer = await new Promise((resolve) => {
          readline.question(`\n🔍 Enter the number of the backup to restore (1-${backups.length}), or 'c' to cancel: `, resolve);
        });
        
        if (answer.toLowerCase() === 'c' || answer.toLowerCase() === 'cancel') {
          console.log('❌ Operation cancelled by user');
          readline.close();
          return;
        }
        
        const selectedIndex = parseInt(answer) - 1;
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= backups.length) {
          console.log('❌ Invalid selection. Operation cancelled.');
          readline.close();
          return;
        }
        
        backupFile = backups[selectedIndex];
        console.log(`✅ Selected backup: ${backupFile}`);
      } finally {
        readline.close();
      }
    }

    // Show what will be restored
    const restoreData = JSON.parse(await fs.readFile(backupFile, 'utf8'));
    console.log(`\n📥 Will restore from: ${backupFile}`);
    console.log('📊 Tables to be restored:');
    Object.entries(restoreData).forEach(([tableName, rows]) => {
      console.log(`   ${tableName}: ${rows ? rows.length : 0} records`);
    });

    // Final confirmation
    const readline = (await import('readline')).createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    let currentBackupFile = null;
    try {
      const confirmAnswer = await new Promise((resolve) => {
        readline.question(`\n⚠️  This will DELETE ALL EXISTING DATA. A backup will be created first. Continue? (y/N): `, resolve);
      });
      
      if (confirmAnswer.toLowerCase() !== 'y' && confirmAnswer.toLowerCase() !== 'yes') {
        console.log('❌ Operation cancelled by user');
        readline.close();
        return;
      }
    } finally {
      readline.close();
    }

    // Take backup of current data before restore (only if user confirmed)
    console.log('\n💾 Creating backup of current data before restore...');
    currentBackupFile = await backupDatabase();
    console.log(`✅ Current data backed up to: ${currentBackupFile}`);

    await client.query('BEGIN');
    console.log(`\n🔄 Restoring from backup: ${backupFile}...`);
    
    // Clear existing data first
    console.log('🧹 Clearing existing data...');
    const tables = Object.keys(restoreData).reverse();
    for (const table of tables) {
      await client.query(`DELETE FROM ${table}`);
      console.log(`   Cleared table: ${table}`);
    }

    // Insert data table by table
    let totalRecords = 0;
    for (const [tableName, rows] of Object.entries(restoreData)) {
      if (rows && rows.length > 0) {
        console.log(`   ${tableName}: restoring ${rows.length} records`);
        totalRecords += rows.length;

        const columns = Object.keys(rows[0]);
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
        
        for (const row of rows) {
          const values = columns.map(col => row[col]);
          
          const query = `
            INSERT INTO ${tableName} (${columns.join(', ')})
            VALUES (${placeholders})
            ON CONFLICT DO NOTHING
          `;
          
          await client.query(query, values);
        }
      }
    }

    await client.query('COMMIT');
    console.log(`\n✅ Restore completed!`);
    console.log(`📊 Total records restored: ${totalRecords}`);
    console.log(`💾 Previous data backed up to: ${currentBackupFile}`);
    console.log(`📁 Current data restored from: ${backupFile}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Restore error:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function restoreLatestBackup() {
  const backups = await listBackups();
  if (backups.length > 0) {
    await restoreFromBackup(backups[0]);
  } else {
    console.log('❌ No backup files found');
  }
}

// Usage examples
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'backup':
        await backupDatabase();
        break;
      case 'restore':
        await restoreFromBackup(process.argv[3]); // Optional filename
        break;
      case 'restore-latest':
        await restoreLatestBackup();
        break;
      case 'list':
        await listBackups();
        break;
      default:
        console.log('Usage:');
        console.log('  npm run backup:list                - List available backups');
        console.log('  npm run backup                     - Create new backup');
        console.log('  npm run backup:restore-latest      - Restore from most recent backup');
        console.log('  npm run backup:restore             - (Interactive restore) choose and restore from listed backups');
        console.log('  node backupData.js restore <file>  - Restore from specific file');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { backupDatabase, restoreFromBackup, restoreLatestBackup, listBackups };