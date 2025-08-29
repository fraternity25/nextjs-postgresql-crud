import {
  // General icons
  faPaperclip, faPlus, faCheck, faSquareCheck,
  // Sidebar General icons
  faHome, faHeadset, faCircleExclamation, 
  faChevronLeft, faChevronRight, faChevronDown, 
  faChevronUp,
  // User icons
  faUsers, faUser, faUserPlus, faUserGear, 
  faUserShield, faUserPen, faRightFromBracket, 
  // Task icons
  faTasks, faCheckCircle, faClipboardList, 
  faPlusSquare, faCalendarCheck, faListCheck, 
  faPenToSquare, 
  // Notification icons
  faBell, faBellSlash, faEnvelope, 
  faExclamationTriangle, faCircleInfo, 
  faCheckDouble  
} from '@fortawesome/free-solid-svg-icons';

const generalIcons = {
  create: faPlus,
  select: faCheck,
  selectMultiple: faSquareCheck,
  attach: faPaperclip,
};

const sidebarIcons = {
  home: faHome,
  forms: faHeadset,
  tickets: faCircleExclamation,
  collapse: faChevronLeft,
  expand: faChevronRight,
  up: faChevronUp,
  down: faChevronDown
};

const userIcons = {
  list: faUsers,
  single: faUser,
  add: faUserPlus,
  settings: faUserGear,
  admin: faUserShield,
  edit: faUserPen,
  logout: faRightFromBracket
};

const taskIcons = {
  list: faTasks,
  edit: faPenToSquare,
  completed: faCheckCircle,
  details: faClipboardList,
  add: faPlusSquare,
  scheduled: faCalendarCheck,
  checklist: faListCheck
};

const notificationIcons = {
  bell: faBell,
  mute: faBellSlash,
  message: faEnvelope,
  alert: faExclamationTriangle,
  info: faCircleInfo,
  read: faCheckDouble
};

export { generalIcons, sidebarIcons, userIcons, taskIcons, notificationIcons };