import {LayoutTemplates} from "./templates/layout.templates";
import {activePage, initializeStore} from "./classes/store";
import {addShortCutListener} from "./classes/shortcuts";

initializeStore();

const content = document.getElementById('content');
const app = LayoutTemplates.app(activePage);
content.appendChild(app);

addShortCutListener();