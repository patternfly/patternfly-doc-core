// Updated format for section gallery component data. Now is an object containing JSX, to avoid having to parse JSON into JSX
// Added the label & a optional fields
// illustration field may not be necessary now
export const componentsData = {
  'about-modal': {
    illustration: './images/component-illustrations/about-modal.png',
    summary:
      'An <b>about modal</b> displays information about an application, like product version numbers and any appropriate legal text.',
  },
  accordion: {
    illustration: './images/component-illustrations/accordion.png',
    summary:
      'An <b>accordion</b> is a vertically stacked list that can be expanded and collapsed to reveal and hide nested content.',
  },
  'action-list': {
    illustration: './images/component-illustrations/action-list.png',
    summary:
      'An <b>action list</b> is a group of actions, controls, or buttons with built-in spacing.',
  },
  alert: {
    illustration: './images/component-illustrations/alert.png',
    summary:
      'An <b>alert</b> is a non-intrusive notification that shares brief, important messages with users.',
  },
  'application-launcher': {
    illustration: './images/component-illustrations/application-launcher.png',
    summary:
      'An <b>application launcher</b> is a menu that allows users to launch a separate web application in a new browser window.',
    label: 'demo',
  },
  avatar: {
    illustration: './images/component-illustrations/avatar.png',
    summary:
      'An <b>avatar</b> is a visual representation of a user, which can contain an image or placeholder graphic.',
  },
  'back-to-top': {
    illustration: './images/component-illustrations/back-to-top.png',
    summary:
      'The <b>back to top</b> component is a shortcut that allows users to quickly navigate to the top of a page via a button.',
  },
  backdrop: {
    illustration: './images/component-illustrations/backdrop.png',
    summary:
      'A <b>backdrop</b> is a screen that covers the main content of a page when a modal is opened, to prevent page interaction until the modal is dismissed.',
  },
  'background-image': {
    illustration: './images/component-illustrations/background-image.png',
    summary:
      'A <b>background image</b> is an image that fills the background of a page.',
  },
  badge: {
    illustration: './images/component-illustrations/badge.png',
    summary: 'A <b>badge</b> is an annotation that displays a numeric value.',
  },
  banner: {
    illustration: './images/component-illustrations/banner.png',
    summary:
      'A <b>banner</b> is a short message that is shared with users in an unobtrusive, full-width container that cannot be dismissed.',
  },
  brand: {
    illustration: './images/component-illustrations/brand.png',
    summary:
      'A <b>brand</b> is a visual representation of a product&mdash;typically its logo.',
  },
  breadcrumb: {
    illustration: './images/component-illustrations/breadcrumb.png',
    summary:
      'A <b>breadcrumb</b> is a secondary navigation method that shows where users are in an application, to help them navigate more efficiently.',
  },
  button: {
    illustration: './images/component-illustrations/button.png',
    summary:
      'A <b>button</b> is an object that communicates and triggers an action when it is clicked or selected.',
  },
  'calendar-month': {
    illustration: './images/component-illustrations/calendar-month.png',
    summary:
      'A <b>calendar month</b> component allows users to select and navigate between days, months, and years.',
  },
  card: {
    illustration: './images/component-illustrations/card.png',
    summary:
      'A <b>card</b> is a content container that displays entry-level information&mdash;typically within dashboards, galleries, and catalogs.',
  },
  checkbox: {
    illustration: './images/component-illustrations/checkbox.png',
    summary:
      'A <b>checkbox</b> is an input control that allows users to select a single item or multiple items from a list.',
  },
  chip: {
    illustration: './images/component-illustrations/chip.png',
    summary:
      "A <b>chip</b> is used to communicate a value or a set of attribute-value pairs within workflows that involve filtering a set of objects.<br /><br /><b>Note:</b> The chip component has been deprecated. Our new recommendation is to use <a href='/components/label'>the label component</a> instead.",
    label: 'deprecated',
  },
  'clipboard-copy': {
    illustration: './images/component-illustrations/clipboard-copy.png',
    summary:
      'The <b>clipboard copy</b> component allows users to quickly and easily copy content to their clipboard.',
  },
  'code-block': {
    illustration: './images/component-illustrations/code-block.png',
    summary:
      "A <b>code block</b> contains 2 or more lines of read-only code, which can be copied to a user's clipboard.",
  },
  'code-editor': {
    illustration: './images/component-illustrations/code-editor.png',
    summary:
      "A <b>code editor</b> is a versatile <a href='https://microsoft.github.io/monaco-editor/'>Monaco-based</a> text editor that supports various programming languages.",
  },
  content: {
    illustration: './images/component-illustrations/context-selector.png',
    summary:
      'A <b>content</b> component contains a block of styled HTML content.',
  },
  'context-selector': {
    illustration: './images/component-illustrations/context-selector.png',
    summary:
      "A <b>context selector</b> is a dropdown menu placed in the global navigation, which allows you to switch a user's application context to display relevant data and resources.",
    label: 'demo',
  },
  'custom-menus': {
    illustration: './images/component-illustrations/custom-menus.png',
    summary:
      "<b>Custom menus</b> can be created to address a variety of unique use cases, by combining <a href='/components/menus/menu'>menus</a> and <a href='/components/menus/menu-toggle'>menu toggles.</a>",
    label: 'demo',
  },
  'data-list': {
    illustration: './images/component-illustrations/data-list.png',
    summary:
      'A <b>data list</b> displays large data sets and interactive content in a flexible layout.',
  },
  'date-picker': {
    illustration: './images/component-illustrations/date-picker.png',
    summary:
      'A <b>date picker</b> allows users to either manually enter a date or select a date from a calendar.',
  },
  'date-and-time-picker': {
    illustration: './images/component-illustrations/date-and-time-picker.png',
    summary:
      "A <b>date and time picker</b> allows users to select both a specific date and a time, by combining <a href='/components/date-and-time/date-picker'>date picker</a> and <a href='/components/date-and-time/time-picker'>time picker</a> components.",
    label: 'demo',
  },
  'description-list': {
    illustration: './images/component-illustrations/description-list.png',
    summary:
      'A <b>description list</b> displays terms and their corresponding descriptions.',
  },
  divider: {
    illustration: './images/component-illustrations/divider.png',
    summary:
      'A <b>divider</b> is a horizontal or vertical line that is placed between screen elements to create visual divisions and content groupings.',
  },
  'drag-and-drop': {
    illustration: './images/component-illustrations/drag-and-drop.png',
    summary:
      'The <b>drag and drop</b> component allows users to reposition, rearrange, and group items into more relevant and appropriate layouts.',
  },
  drawer: {
    illustration: './images/component-illustrations/drawer.png',
    summary:
      'A <b>drawer</b> is a sliding panel that enters from outside of the viewport, which can be configured to either overlay content or create a sidebar by pushing content.',
  },
  dropdown: {
    illustration: './images/component-illustrations/dropdown.png',
    summary:
      'A <b>dropdown</b> displays a menu of actions that trigger a process and as that navigate to a new location.',
    label: 'beta',
  },
  'dual-list-selector': {
    illustration: './images/component-illustrations/dual-list-selector.png',
    summary:
      'A <b>dual list selector</b> displays 2 interactive lists: a list of selected items and a list of available, selectable items. Users can move items between the lists.',
  },
  'empty-state': {
    illustration: './images/component-illustrations/empty-state.png',
    summary:
      'An <b>empty state</b> is a screen that is not yet populated with data or information&mdash;typically containing a short message and next steps for users.',
  },
  'expandable-section': {
    illustration: './images/component-illustrations/expandable-section.png',
    summary:
      'An <b>expandable section</b> is a content section with a text toggle that reveals content that is hidden by default.',
  },
  'multiple-file-upload': {
    illustration: './images/component-illustrations/file-upload-multiple.png',
    summary:
      'A <b>multiple file upload</b> component allows users to select and upload multiple files to a specific location.',
  },
  'simple-file-upload': {
    illustration: './images/component-illustrations/file-upload.png',
    summary:
      'A <b>simple file upload</b> component allows users to select and upload a single file to a specific location.',
  },
  'form-control': {
    illustration: './images/component-illustrations/form-control.png',
    summary:
      'A <b>form control</b> is a form element that guides users and accepts user input, such as text areas and selection menus.',
  },
  form: {
    illustration: './images/component-illustrations/form.png',
    summary:
      'A <b>form</b> is a group of related elements that allow users to provide data and configure options in a variety of contexts, such as within modals, wizards, and pages.',
  },
  'form-select': {
    illustration: './images/component-illustrations/form-select.png',
    summary:
      'A <b>form select</b> is a form element that embeds browser-native menus.',
  },
  'helper-text': {
    illustration: './images/component-illustrations/helper-text.png',
    summary:
      '<b>Helper text</b> is a text-based support method that adds additional context to field inputs.',
  },
  hint: {
    illustration: './images/component-illustrations/hint.png',
    summary:
      'A <b>hint</b> is an in-app message that shares reminders, explanations, or calls to action within a page or modal.',
  },
  icon: {
    illustration: './images/component-illustrations/icon.png',
    summary:
      "An <b>icon</b> component is a container that supports <a href='/design-foundations/icons#all-icons'>icons</a> of varying dimensions and styles, as well as <a href='/components/spinner'>spinners.</a>",
  },
  'inline-edit': {
    illustration: './images/component-illustrations/inline-edit.png',
    summary:
      'An <b>inline edit</b> component allows users to switch between read-only and edits views of description lists, page text elements, or tables&mdash;within the context of their current view.',
  },
  'input-group': {
    illustration: './images/component-illustrations/input-group.png',
    summary:
      'An <b>input group</b> combines multiple related controls or inputs to appear as a single control.',
  },
  'jump-links': {
    illustration: './images/component-illustrations/jump-links.png',
    summary:
      'When clicked, <b>jump links</b> allow users to navigate to sections within a page without scrolling.',
  },
  label: {
    illustration: './images/component-illustrations/label.png',
    summary:
      'A <b>label</b> is a descriptive annotation that adds context to an element for clarity and convenience.',
  },
  list: {
    illustration: './images/component-illustrations/list.png',
    summary:
      'A <b>list</b> component embeds a formatted list&mdash;bulleted or numbered&mdash;into page content.',
  },
  'login-page': {
    illustration: './images/component-illustrations/login-page.png',
    summary:
      'A <b>login page</b> allows a user to access an application by entering a username and password, or by authenticating using a social media login.',
  },
  masthead: {
    illustration: './images/component-illustrations/masthead.png',
    summary:
      'A <b>masthead</b> contains and organizes global properties like a logo, navigation, and settings for easy and consistent access across all pages of an application.',
  },
  'menu-toggle': {
    illustration: './images/component-illustrations/menu-toggle.png',
    summary:
      'A <b>menu toggle</b> is a selectable control that opens and closes a menu.',
  },
  menu: {
    illustration: './images/component-illustrations/menu.png',
    summary:
      'A <b>menu</b> is a list of options or actions that users can choose from.',
  },
  modal: {
    illustration: './images/component-illustrations/modal.png',
    summary:
      'A <b>modal</b> is a window that overlays a page to display important information, without requiring users to navigate to a new page.',
  },
  navigation: {
    illustration: './images/component-illustrations/navigation.png',
    summary:
      "A <b>navigation</b> component organizes and communicates an application's structure and content in a central location, making it easy to find information and accomplish tasks.",
  },
  'notification-badge': {
    illustration: './images/component-illustrations/notification-badge.png',
    summary:
      'A <b>notification badge</b> is a visual indicator that alerts users about incoming notifications.',
  },
  'notification-drawer': {
    illustration: './images/component-illustrations/notification-drawer.png',
    summary:
      "A <b>notification drawer</b> contains an application's notifications, which users can view and manage without having to navigate to a new screen.",
  },
  'number-input': {
    illustration: './images/component-illustrations/number-input.png',
    summary:
      'A <b>number input</b> combines a text input field with buttons to provide users with a quick and effective way to enter and modify a numeric value.',
  },
  'options-menu': {
    illustration: './images/component-illustrations/options-menu.png',
    summary: 'An <b>options menu</b> contains a set of optional settings.',
    label: 'demo',
  },
  'overflow-menu': {
    illustration: './images/component-illustrations/overflow-menu.png',
    summary:
      'An <b>overflow menu</b> groups a set of actions into a responsive horizontal list to help declutter the UI.',
  },
  page: {
    illustration: './images/component-illustrations/page.png',
    summary:
      'A <b>page</b> component defines the basic layout of a page, with either vertical or horizontal navigation.',
  },
  pagination: {
    illustration: './images/component-illustrations/pagination.png',
    summary:
      'A <b>pagination</b> component allows users to navigate through large content views that have been split across multiple pages.',
  },
  panel: {
    illustration: './images/component-illustrations/panel.png',
    summary:
      'A <b>panel</b> is a customizable container that can contain other components in flexible content layouts.',
  },
  'password-generator': {
    illustration: './images/component-illustrations/password-generator.png',
    summary:
      'This demo demonstrates how to create an input field that generates unique passwords.',
    label: 'demo',
  },
  'password-strength': {
    illustration: './images/component-illustrations/password-strength.png',
    summary:
      'This demo demonstrates how to validate and display feedback about password strength.',
    label: 'demo',
  },
  popover: {
    illustration: './images/component-illustrations/popover.png',
    summary:
      'A <b>popover</b> is a small overlay window that provides additional information about an on-screen element.',
  },
  'progress-stepper': {
    illustration: './images/component-illustrations/progress-stepper.png',
    summary:
      "A <b>progress stepper</b> displays a timeline of tasks in a workflow and tracks a user's progress through the workflow.",
  },
  progress: {
    illustration: './images/component-illustrations/progress.png',
    summary:
      'A <b>progress</b> component is a horizontal bar that indicates the completion status of an ongoing process or task.',
  },
  radio: {
    illustration: './images/component-illustrations/radio.png',
    summary:
      "A <b>radio</b> is a button that's used to present users with mutually exclusive choices.",
  },
  'search-input': {
    illustration: './images/component-illustrations/search-input.png',
    summary:
      'A <b>search input</b> is a type of input field that can be used to search, find, or filter.',
  },
  select: {
    illustration: './images/component-illustrations/select.png',
    summary:
      'A <b>select</b> component is a menu that enables users to select 1 or more items from a list.',
    label: 'beta',
  },
  sidebar: {
    illustration: './images/component-illustrations/sidebar.png',
    summary:
      'A <b>sidebar</b> is a panel that splits content into a secondary area within a page.',
  },
  'simple-list': {
    illustration: './images/component-illustrations/simple-list.png',
    summary: 'A <b>simple list</b> displays selectable items within a page.',
  },
  skeleton: {
    illustration: './images/component-illustrations/skeleton.png',
    summary:
      'A <b>skeleton</b> is a type of loading state that allows you to expose content incrementally.',
  },
  'skip-to-content': {
    illustration: './images/component-illustrations/skip-to-content.png',
    summary:
      'A <b>skip to content</b> component allows users to bypass navigation when using a screen reader or keyboard',
  },
  slider: {
    illustration: './images/component-illustrations/slider.png',
    summary:
      'A <b>slider</b> is an interactive element that allows users to quickly set and adjust a numeric value from a defined range of values.',
  },
  spinner: {
    illustration: './images/component-illustrations/spinner.png',
    summary:
      'A <b>spinner</b> is an animated visual that indicates when a quick action is in progress.',
  },
  switch: {
    illustration: './images/component-illustrations/switch.png',
    summary:
      'A <b>switch</b> is a control that toggles the state of a setting between on and off.',
  },
  'tab-content': {
    illustration: './images/component-illustrations/tab-content.png',
    summary:
      'A <b>tab content</b> component is used to contain content within a tab.',
  },
  table: {
    illustration: './images/component-illustrations/table.png',
    summary:
      'A <b>table</b> displays large data sets in a simple grid with column headers.',
  },
  tabs: {
    illustration: './images/component-illustrations/tabs.png',
    summary: '<b>Tabs</b> group similar content within sub-views of a page.',
  },
  'text-area': {
    illustration: './images/component-illustrations/text-area.png',
    summary:
      'A <b>text area</b> allows users to enter a longer paragraph of text.',
  },
  'text-input-group': {
    illustration: './images/component-illustrations/text-input-group.png',
    summary:
      "A <b>text input group</b> is a more custom, flexible, and composable version of a <a href='/components/forms/text-input'>text input</a> that includes elements like icons and buttons.",
  },
  'text-input': {
    illustration: './images/component-illustrations/text-input.png',
    summary: 'A <b>text input</b> components allows users to input short text.',
  },
  tile: {
    illustration: './images/component-illustrations/tile.png',
    summary:
      'A <b>tile</b> is a container that allows users to select a static option.',
    label: 'deprecated',
  },
  'time-picker': {
    illustration: './images/component-illustrations/time-picker.png',
    summary:
      'A <b>time picker</b> component allows users to select a time from a list of options.',
  },
  timestamp: {
    illustration: './images/component-illustrations/timestamp.png',
    summary:
      'A <b>timestamp</b> is a consistently formatted visual that displays date and time values.',
  },
  title: {
    illustration: './images/component-illustrations/title.png',
    summary:
      'A <b>title</b> component applies top and bottom margins, font-weight, font-size, and line-height to page and section headings.',
  },
  'toggle-group': {
    illustration: './images/component-illustrations/toggle-group.png',
    summary:
      'A <b>toggle group</b> is a set of controls that can be used to quickly switch between actions or states.',
  },
  toolbar: {
    illustration: './images/component-illustrations/toolbar.png',
    summary:
      'A <b>toolbar</b> is a responsive container that displays controls that allow users to manage and manipulate a data set.',
  },
  tooltip: {
    illustration: './images/component-illustrations/tooltip.png',
    summary:
      'A <b>tooltip</b> is a small, temporary, overlay window that provides additional information about an on-screen element.',
  },
  'tree-view': {
    illustration: './images/component-illustrations/tree-view.png',
    summary:
      'A <b>tree view</b> is a structure that displays data in a hierarchical view.',
  },
  truncate: {
    illustration: './images/component-illustrations/truncate.png',
    summary:
      'A <b>truncate</b> component can be used to shorten character strings&mdash;typically when the string overflows its container.',
  },
  wizard: {
    illustration: './images/component-illustrations/wizard.png',
    summary:
      'A <b>wizard</b> is a guided workflow that helps users complete complex tasks, create objects, or follow a series of steps.',
  },
}
