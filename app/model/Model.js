import 'regenerator-runtime/runtime';
import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Box, Button, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { EditorState, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { GoogleGenerativeAI } from '@google/generative-ai';
import htmlToDraft from 'html-to-draftjs';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PersonIcon from '@mui/icons-material/Person';
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

export default function Speech() {
  const { transcript, browserSupportsSpeechRecognition, listening } = useSpeechRecognition();
  const [query, setQuery] = useState("");
  const [responseText, setResponseText] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [language, setLanguage] = useState('en-IN'); 

  const listen = () => {
    SpeechRecognition.startListening({ continuous: true, language: language });
  };

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };

  const handleClick = async () => {
    try {
      const formattedQuery = `SUBJECTIVE
Chief Complaint:

History of Presenting Complaint:
Insufficient information provided to generate a history of presenting complaint.

OBJECTIVE
Vital Signs:
Not provided.
Systems Review:
Not provided.
Examination:
No examination findings recorded.


ASSESSMENT
Differential diagnoses considered(disease detection):


PLAN
Medications:
No medications documented.
Radiology/pathology:
Not ordered.
Management Plan:
Insufficient information to generate a management plan. Further investigation is required.

Follow Up:
Not specified.

Make changes according to: "${transcript}". 
Don't change the things which are not specified. If medication is specified, then only make changes and also detect nearest possible 1-2 diseases.Also avoid repeatation`;

      setQuery(formattedQuery);

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(formattedQuery);
      const response = await result.response.text();
      console.log("Generated Response:", response);


      const formattedResponse = breakString(response);

      const contentBlock = htmlToDraft(formattedResponse);
      const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
      const editorState = EditorState.createWithContent(contentState);

      setEditorState(editorState);
      setResponseText(formattedResponse);
    } catch (error) {  
      console.error('Error generating content:', error);
      setResponseText('An error occurred while generating the content.');
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <Typography variant="body1">Browser does not support speech recognition.</Typography>;
  }

  function breakString(input) {
    const extraBoldText = input.replace(/##\s*(\w+)/g, '<b><strong>$1</strong></b><br></br>');
    const boldText = extraBoldText.replace(/\*\*(.*?)\*\*/g, '<span style="font-size:17px; font-weight:700;">$1</span>');
    return boldText;
  }

  const [text, setText] = useState('');
  const[age,setAge] =useState('')
  useEffect(() => {
    const storedText = localStorage.getItem('textValue');
    if (storedText) {
      setText(storedText);
    }
  }, []);
  useEffect(() => {
    const storedAge = localStorage.getItem('age');
    if (storedAge) {
      setAge(storedAge);
    }
  }, []);
  return (
    <>
      <Box mt={4} sx={{ display: 'flex', alignItems: 'center', color: 'rgb(41, 87, 106)', fontWeight: 'bold', width: "1920px", justifyContent: 'left', borderBottom: '2px solid #f3f3f4', padding: '10px', }}>
        <PersonIcon sx={{ marginRight: 1, fontSize: '45px' }} />
        <Typography variant="h4" sx={{ color: 'rgb(41, 87, 106)', fontWeight: 'bold' }}>{text}</Typography>
        <Typography variant="h5" ml={150} sx={{ color: 'rgb(41, 87, 106)', fontWeight: 'bold' }}>Age:{age}</Typography>
      </Box>
      
      <Box sx={{ width: "100%", padding: 2, backgroundColor: 'white', display: 'flex', justifyContent: 'space-between' }}>
        <Box mt={12} >
         
          <FormControl sx={{ minWidth: 200, marginBottom: 2 }}>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              label="Language"
            >
              <MenuItem value="en-IN">English (India)</MenuItem>
              <MenuItem value="en-US">English (US)</MenuItem>
              <MenuItem value="hi-IN">Hindi (India)</MenuItem>
              <MenuItem value="es-ES">Spanish (Spain)</MenuItem>
             
            </Select>
          </FormControl>

          <Box sx={{ marginBottom: 2 }}>
            <Button variant="contained" onClick={listen} disabled={listening} startIcon={<MicIcon />} sx={{ backgroundColor: 'rgb(193, 240, 214)', color: 'rgb(41, 87, 106)', borderRadius: '28px', padding: '5px 5px', fontSize: '14px', height: '40px', textTransform: 'none', fontWeight: 'bold', width: '180px', '&:hover': { backgroundColor: '#7be8a8', color: 'rgb(35, 68, 91)', } }}>
              Start Recording
            </Button>
            <Button variant="contained" onClick={stopListening} disabled={!listening} startIcon={<StopIcon />} sx={{ backgroundColor: 'rgb(193, 240, 214)', color: 'rgb(41, 87, 106)', borderRadius: '28px', padding: '5px 5px', fontSize: '14px', height: '40px', textTransform: 'none', fontWeight: 'bold', width: '130px', marginLeft: 2, '&:hover': { backgroundColor: '#7be8a8', color: 'rgb(35, 68, 91)', } }}>
              Stop
            </Button>
          </Box>

          <Box width={350} height={200} sx={{ backgroundColor: 'white', padding: 2, overflow: 'auto', border: '2px solid rgb(193, 240, 214)', borderRadius: '10px' }}>
            <Typography variant="body1">{transcript}</Typography>
          </Box>

          <Box sx={{ marginTop: 2 }}>
            <Button variant="contained" onClick={handleClick} sx={{ backgroundColor: 'rgb(193, 240, 214)', color: 'rgb(41, 87, 106)', borderRadius: '28px', padding: '3.5px 3.5px', fontSize: '14px', height: '40px', textTransform: 'none', fontWeight: 'bold', width: '160px', '&:hover': { backgroundColor: '#7be8a8', color: 'rgb(35, 68, 91)', } }}>
              Generate Notes
            </Button>
          </Box>
        </Box>

        <Box width={620} height={850} mr={20} sx={{ padding: 2, overflow: 'auto', marginTop: 2, border: '2px solid #00374e', borderRadius: '10px', background: 'linear-gradient(to right,#e2f9ec 25%,#fbf7f4,#e5efed)' }}>
          <Editor
            editorState={editorState}
            wrapperClassName="demo-wrapper"
            editorClassName="demo-editor"
            toolbar={{
              options: ['inline', 'list', 'textAlign', 'history'],
              inline: {
                options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
              },
            }}
            onEditorStateChange={setEditorState}
          />
        </Box>
      </Box>
    </>
  );
}
