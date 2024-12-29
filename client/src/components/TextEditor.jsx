// TODO: auto-save the document after every 10 seconds -- need to have backend support for this.

import React, { useCallback, useEffect, useState, useRef } from "react";
// import * as Y from 'yjs';
// import { WebrtcProvider } from 'y-webrtc';
// import * as awarenessProtocol from 'y-protocols/awareness.js';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import './TextEditor.css';


<link href="https://cdn.quilljs.com/1.3.6/quill.snow.css" rel="stylesheet"></link>


function TextEditor() {

  // This using of useRef for wrapping up the editor-box container is fine that ensures that the editor is not re-rendered every time the state changes. The problem associated with this is that the editor is not destroyed when the component is unmounted. So, we need to destroy the editor when the component is unmounted. This can be done by using useEffect hook.
  // The return function in the useEffect adds-up the cleanup when the component is unmounted. This is the place where we destroy the innerHTML in the editor-container so that no extra editor is created when the component is re-mounted.

  // This code is technically correcgt but the problem is that sometimes we the useEffect gets called even if the reference is not properly assigned/set to the HTML element we are assigning, this may cause unusual behaviour and sometimes errors.
  // ```
  // const editorRef = useRef();
  // useEffect(() => {
  //   const editor = document.createElement('div');
  //   editorRef.current.append(editor);
  //   const quill = new Quill(editor, {
  //     theme: 'snow'
  //   });
    
  //   return () => {
  //     editorRef.innerHTML = '';
  //   }
  // }, []);
  // ```
  
  // SOLUTION for this
  // Instead of useEffect, we bind useCallback hook with our editorRef which ensures that the reference is defined before the callback is called. Actually the callback is called when the reference is defined. Understand this as we set the reference to the HTML element and that reference is passed to the callback function. So, the callback function is called when the reference is defined. simple :)
  const [quill, setQuill] = useState();
  const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
  ];
  const editorRef = useCallback((editorRef) => {
    if (!editorRef)  return ;

    editorRef.innerHTML = '';
    const editor = document.createElement('div');
    editorRef.append(editor);
    const q = new Quill(editor, {
      theme: 'snow',
      modules: { toolbar: TOOLBAR_OPTIONS }
    });

    q.disable();
    q.setText('Loading...');
    setQuill(q);
    
    // cleaning up the code before the component is re-assigned when re-rendered.
    // return () => {
    //   editorRef.innerHTML = '';
    // }
  }, []);

  const [socket, setSocket] = useState();
  useEffect(() => {
    // if (!socket)  return ;
    const s = io('http://localhost:8000');
    setSocket(s);

    // cleaning up the code after the component is unmounted.
    return () => {
      socket.disconnect();
    }
  }, []);

  // hook for emitting the changes to the server.
  useEffect(() => {
    if (!socket || !quill) return ;

    // delta is the small subset of the whole document that is changed.
    const socketHandler = (delta, oldDelta, source) => {
      if (source !== 'user') return ;
      socket.emit('send-changes', delta);
    }
    quill.on('text-change', socketHandler);

    return () => {
      quill.off('text-change', socketHandler);
    }
  }, [quill, socket]);

  // hook for receiving the changes from the server.
  useEffect(() => {
    if (!socket || !quill) return ;
    if(socket == null || quill == null) return ;

    const quillHandler = (delta) => {
      quill.updateContents(delta)
    }
    socket.on('receive-changes', quillHandler);

    return () => {
      socket.off('receive-changes', quillHandler);
    }
  }, [quill, socket]);

  const { id: documentID } = useParams();
  // hook for loading the document from the server, with the specified documentID.
  useEffect(() => {
    if (!socket || !quill) return ;

    // loading the document from the server and enabling editing access.
    socket.once('load-document', doc => {
      quill.setContents(doc);
      quill.enable();
    })

    // sending the docID to the server (so that we can broadcast the changes to that particular documentID only)
    socket.emit('get-document', documentID);
  }, [quill, socket, documentID]);

  return (
    <div
      className="editor-container"
      ref={editorRef}>
    </div>
  );
}

export default TextEditor;
