import {
  faHome, faPlus, faHeadset, faCircleExclamation, faChevronLeft, faChevronRight, // Sidebar General icons
  faUsers, faUser, faUserPlus, faUserGear, faUserShield, faUserPen, // User icons
  faTasks, faCheckCircle, faClipboardList, faPlusSquare, faCalendarCheck, faListCheck, // Task icons
  faBell, faBellSlash, faEnvelope, faExclamationTriangle, faCircleInfo, faCheckDouble  // Notification icons
} from '@fortawesome/free-solid-svg-icons';

const sidebarIcons = {
  home: faHome,
  create: faPlus,
  forms: faHeadset,
  tickets: faCircleExclamation,
  collapse: faChevronLeft,
  expand: faChevronRight
};

const userIcons = {
  list: faUsers,
  single: faUser,
  add: faUserPlus,
  settings: faUserGear,
  admin: faUserShield,
  edit: faUserPen
};

const taskIcons = {
  list: faTasks,
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

export { sidebarIcons, userIcons, taskIcons, notificationIcons };