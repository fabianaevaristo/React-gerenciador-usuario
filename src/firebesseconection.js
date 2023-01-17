import { initializeApp} from 'firebase/app'
import { getFirestore} from 'firebase/firestore' //sistema de banco de dados
import {getAuth} from 'firebase/auth' //o Auth permite fazer login, criar usuário, trabalhar com autenticação.
import env from "react-dotenv";

const firebaseConfig = {
    apiKey: env.REACT_APP_API_KEY,
    authDomain: env.REACT_APP_AUTH_DOMAIN,
    projectId: env.REACT_APP_PROJECT_ID,
    storageBucket: env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: env.REACT_APP_MESSAGING_SENDER_ID,
    appId: env.REACT_APP_APP_ID,
    measurementId: env.REACT_APP_MEASUREMENT_ID
  };

  const firebaseApp = initializeApp(firebaseConfig);

  const db = getFirestore(firebaseApp); //conexão com o banco de dados
  const auth = getAuth(firebaseApp) //

  export { db, auth};//coloca aqui o auth que é conexão para poder ser exportado