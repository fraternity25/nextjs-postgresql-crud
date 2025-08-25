import {
  faPaperclip, faPlus, faCheck, faSquareCheck,// General icons
  faHome, faHeadset, faCircleExclamation, faChevronLeft, faChevronRight, // Sidebar General icons
  faUsers, faUser, faUserPlus, faUserGear, faUserShield, faUserPen, faRightFromBracket, // User icons
  faTasks, faCheckCircle, faClipboardList, faPlusSquare, faCalendarCheck, faListCheck, faPenToSquare, // Task icons
  faBell, faBellSlash, faEnvelope, faExclamationTriangle, faCircleInfo, faCheckDouble  // Notification icons
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
  expand: faChevronRight
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