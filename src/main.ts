import { createApp } from 'vue';

import App from './App.vue';
import { initFirebase } from './firebase/config';
import './index.css';

initFirebase();
createApp(App).mount('#app');
