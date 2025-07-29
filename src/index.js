import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store/store';
import { login } from './store/memberSlice';

export const Context = createContext();

let host = 'http://scheduly.duckdns.org:8080';

// 로그인 정보 유지
const userStr = localStorage.getItem('user');
const token = localStorage.getItem('token');
if(userStr && userStr!== undefined) {
    try{
        const user = JSON.parse(userStr);
        store.dispatch(login({user: user, token: token}))
    } catch(err) {
        console.log("JSON 파싱 실패", err);
    }
    
    
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Context.Provider value={{ host }}>
        <Provider store={store}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
        </Provider>
    </Context.Provider>


);

