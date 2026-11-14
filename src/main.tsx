import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { applyLang, applyLooks, applyTheme, getData } from './core/store';
import './styles.css';

applyTheme(getData().theme);
applyLang(getData().lang);
applyLooks();
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
