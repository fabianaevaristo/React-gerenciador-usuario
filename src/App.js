import { useState, useEffect} from 'react';
import { db, auth } from './firebesseconection';
import React from 'react';

import { doc, setDoc,
   collection, addDoc,
    getDoc, getDocs, 
    updateDoc, 
    deleteDoc, //utilizamos para deletar um post
    onSnapshot //utilizar aonde ver a necessidade de obter os dados atulizado,não pode utilizar em todos bancos de dados, fica pesado a performace
   } from 'firebase/firestore'
//com createUserWithEmailAndPassword podemos criar um usuário com email e senha.
import { createUserWithEmailAndPassword,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged // ele verifica se tem ou não usuário ele salva no stastore

} from 'firebase/auth'

import './app.css';
import { async } from '@firebase/util';

function App() {
  const [título, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [idPost, setIdPost] = useState('')

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [user, setUser] = useState(false) //ela começa como fazia, não começa logado
  const [userDetail, setUserDetail] = useState({}) // vai começa com objeto vazio,pq ele começa e não está logado.

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function loadPosts(){
      //abaixo estamos fazendo um snapshot, verifeicando em tempo real a nossa coleção de posts e ele vai trazer tudo que encontrar dentro da função anônima.
      const unsub = onSnapshot(collection(db, "posts"), (snapshot) =>{
        let listaPost = [];

        snapshot.forEach((doc) => {
          listaPost.push({
            id: doc.id, 
            título: doc.data().título,
            autor: doc.data().autor,
          })
        })
  //percorre essa nova listaPost e joga dentro da nossa useState
        setPosts(listaPost);
      })
    }

    loadPosts();
  }, []) //as chaves abre e fecha a função anônima e cochetes abre e fecha a rede de dependência
  
  useEffect( () => {
    async function checklogin(){
      onAuthStateChanged(auth, (user) => {
        if(user){
          //se tem usuário logado, ele entra aqui...
          console.log(user);
          setUser(true);
          setUserDetail({
            uid: user.uid,
            email: user.email
          })
        }else{
          //não possui nunhum user logado.
          setUser(false);
          setUser({})
        }
      })
    }

    checklogin();

  },[])

  async function handleAdd(){
    /* await setDoc(doc(db, "posts", "12345"),{
      título: título,
      autor: autor,
    })
    .then(() => {
      console.log("DADOS REGISTRADOS NO BANCO!")
    })
    .catch((error) =>{
      console.log("GEROU ERRO + ERROR")
    }) 
    
    UTILIZA ASSIM QUANDO DESEJA COLOCAR UM id ESPECÍFICO*/

    await addDoc(collection(db, "posts"), { //utilizando o addDoc ele cria automaticamente o id
      título: título,
      autor: autor
    })

    .then(() => {
      console.log ("cadastrato com sucesso")
      setAutor('');
      setTitulo('')
    })

    .catch ((error) => {
      console.log("GEROU ERRO + ERROR")
    })
}
    
  async function buscarPost(){
    
    /*const postRef = doc(db, "posts", "12345")
    await getDoc(postRef)
    .then((snapshot) => {
      setAutor(snapshot.data().autor)
      setTitulo(snapshot.data().título)
      
    })

    .catch(() => {
      console.log ("ERRO AO BUSCAR")
    })
    
    essa função acima representa resgatar um post por vez*/

    const postsRef = collection(db, "posts")
    await getDocs(postsRef)

    .then((snapshot) => {
      let lista = [];

      snapshot.forEach((doc) => {
        lista.push({
          id: doc.id, 
          título: doc.data().título,
          autor: doc.data().autor,
        })
      })

      setPosts(lista);
    })
    .catch((error) => {
      console.log ("DEU ALGUM ERRO AO BUSCAR")
    })
  }

  async function editarPost(){
    const docRef = doc(db, "posts", idPost)
    await updateDoc(docRef, {
      título: título,
      autor: autor
    })
    .then(() => {
      console.log("POST ATUALIZADO!")
      setIdPost('')
      setTitulo('')
      setAutor('')
    })
    .catch(() => {
      console.log("ERRO AO ATUALIZAR O POST")
    })
  }
  
   async function excluirPost(id){ //trasnformar essa função em async para esperar essa requisição, pq quero ir no banco de dados e deletar o item específico então pode demorar um pouco
    const docRef = doc(db, "posts", id) // o docRef é a referencia de onde quero deletar, acessar o doc, nosso bando é o db, o post e o id que está recebendo acima o que deseja deletar.
    await deleteDoc(docRef) //vai esperar o deleteDoc, passa o docREf aonde quero deletar
      //como o await é um promisse, podemos tratar com then e catch
    .then(() =>{
        alert("POST DELETADO COM SUCESSO!")
      })
  }

  async function novoUsuario(){
    await createUserWithEmailAndPassword(auth, email, senha)
    .then(() => {
      console.log("cadastrado com sucesso")
      
      setEmail('')
      setSenha('')
    })
    .catch((error) => {
      if(error.code === 'auth/weak-password'){
        alert("Senha muito fraca.")
      }else if(error.code === 'auth/email-already-in-use'){
        alert("Email já existe!")
      }
    })

    }

    async function logarUsuario(){ //quando fizer o login aqui
      await signInWithEmailAndPassword(auth, email, senha)
      .then((value) => {
        console.log("user logado com sucesso")
        console.log(value.user);

        setUserDetail({ // vamos passar os dados de setUser detail, (o ID do usuário e o email)
        uid: value.user.uid,
        email: value.user.email,
        })
        setUser(true); //com isso ele sai do false para true

        setEmail('')
        setSenha('')
      })
      .catch(() => {
        console.log("ERRO AO FAZER O LOGIN")
      })

    }

    async function fazerLogout(){
      await signOut(auth)
      setUser(false)
      setUserDetail({})
    }

  return (
    <div>
      <h1> ReactJS + Firebase Fabiana 'oi' </h1>

      { user && ( //quando tiver logado ele vai satisfazer as condições e mostrar os detalhes dos itens que foi solicitado aqui
        <div>
          <strong> Seja bem-vindo(a) (você está logado!)</strong> <br/>
          <span>ID: {userDetail.uid} - Email: {userDetail.email} </span> <br/>
          <button onClick={fazerLogout}> Sair da conta </button>
          <br/> <br/>
        </div>
      )}


    <div className='container'>
      <h2> Usuário </h2>

      <label> Email: </label>
      <input
        value={email} //atribui a esse value a função
        onChange={(e) => setEmail(e.target.value)} //função anônima com um evento para passar o que o usuário digitou nesse campo para nossa useState email.
        placeholder="Digite um email"
      /> <br/>

        <label> Senha: </label>
        <input
          value={senha} //atribui a esse value a função
          onChange={(e) => setSenha(e.target.value)} //função anônima com um evento para passar o que o usuário digitou nesse campo para nossa useState email.
          placeholder="Informe sua senha"
      /> <br/>

      <button onClick={novoUsuario}> cadastrar </button>
      <button onClick={logarUsuario}> Fazer login </button>

      </div>  

      <br/> <br/>
      <hr/>

      <div className='container'> 
        <h2> Posts </h2>
        <label> ID do Post: </label>
        <input
        placeholder='Digite o ID do post'
        value={idPost}
        onChange={ (e) => setIdPost(e.target.value) }
      /> <br/>

        <label> Título: </label>
        <textarea 
          type="text"
          placeholder='digiti o título'
          value={título}
          onChange={ (e) => setTitulo(e.target.value) }

        />

        <label> Autor: </label>
        <input 
        type="text" 
        placeholder='Autor do post'
        value={autor}
        onChange={(e) => setAutor(e.target.value) }
        />
        

        <button onClick={handleAdd}> cadastrar </button>
        <button onClick={buscarPost}> Buscar post </button> <br/>

        <button onClick={editarPost}> Atualizar post </button>

        <ul>
          {posts.map( (post) => {
            return(
              <li key={post.id}>
                <strong> ID: {post.id}</strong> <br/>
                <span> Título:{post.título}</span> <br/>
                <span> Autor: {post.autor}</span> <br/> 
                <button onClick={ () => excluirPost(post.id) }> Excluir </button> <br/> <br/>
              </li>
            )
          })}
         
         

        
        </ul>
      
      </div>
    </div>
  );
}

export default App;
