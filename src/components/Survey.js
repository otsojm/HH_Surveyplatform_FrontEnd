import React, { useState, useEffect } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import { Link } from "react-router-dom";

function Survey(props) {

    const [respondent, setRespondent] = useState("");
    const [questions, setQuestions] = useState([]);

    const [surveyId, setSurveyId] = useState(props.match.params.surveyId);
    const [ansNeeded, setAnsNeeded] = useState(0);
    const [surveysLength, setSurveysLength] = useState();

    const [ansMap, setAnsMap] = useState([]);
    const [selectedAns, setSelectedAns] = useState([]);

    const [isVisible, setVisible] = useState(false);

    let dataArray = [];
    let ansArray = [];
    let quesArray = [];
    let filteredData = [];

    const fetchData = () => {

        fetch('https://json.awsproject.link/surveys').then(async response => {

            try {
                const data = await response.json()

                setSurveysLength(data[surveyId - 1].questions.length);

                dataArray.push(data[surveyId - 1]);

                setSurveyId(data[surveyId - 1].s_id);

                ansArray.push(data[0].questions[0].opt1)
                ansArray.push(data[0].questions[0].opt2)
                ansArray.push(data[0].questions[0].opt3)

                setAnsMap(ansArray);

                for (let i = 0; i < data[surveyId - 1].questions.length; i++) {

                    quesArray.push(data[surveyId - 1].questions[i].question);
                }

                setQuestions(quesArray);

            } catch (error) {
                console.error(error)
            }
        })
    }

    useEffect(() => {

        fetchData();
        // eslint-disable-next-line
    }, []);

    const nextPage = () => {

        const id = parseInt(props.match.params.surveyId) + 1;

        if (surveysLength > surveyId) {

            window.location.href = "https://dev.json.awsproject.link/Survey%20" + id;

        } else {

            window.alert("This is the last survey.");
        }
    }


    const postData = () => {

        if (ansNeeded >= surveysLength) {

            if (respondent.toString().includes(" ")) {

                let chars = [];
                selectedAns.reverse();

                for (let i = 0; i < selectedAns.length; i++) {

                    if (!chars.includes(JSON.stringify(selectedAns[i]).split('"')[1])) {

                        filteredData.push(selectedAns[i]);
                        chars.push(JSON.stringify(selectedAns[i]).split('"')[1]);
                    }
                }

                let data = [];

                filteredData.reverse();

                for (let i = 0; i < filteredData.length; i++) {

                    let char = "Q" + (i + 1).toString();
                    data.push({ survey: { s_id: surveyId.toString() }, question: { q_id: (char.split("Q")[1]).toString() }, answer1: filteredData[i][char], answer2: "", answer3: "", answer4: "" });
                }

                fetch('https://json.awsproject.link/answers', { method: 'POST', headers: { 'Content-type': 'application/json' }, body: JSON.stringify({ answers: { respondent: respondent, survey: surveyId.toString(), data: data } }) })
                    .catch(error => console.error(error))

                setVisible(true);

            } else {
                window.alert("Name has a wrong format.");
            }

        } else {
            window.alert("Answer to all the questions.");
        }
    }

    const handleChange = (event) => {

        setAnsNeeded(ansNeeded + 1)

        let answer = JSON.parse('{"Q' + (questions.indexOf(event.target.name) + 1).toString() + '":"' + event.target.value + '"}');

        setSelectedAns(oldArray => [...oldArray, answer]);
    };

    const handleRespondent = (event) => {

        setRespondent(event.target.value)
    };

    return (

        <div>
            <h1>Survey {surveyId}</h1>
            <h2>Demo 1.0.0</h2>
            <Button variant="contained" style={{ margin: '10px' }} class="btn btn-primary" onClick={nextPage}>Next</Button>
            <Link style={{ color: 'white' }} to="/"><button variant="contained" style={{ margin: '10px' }} class="btn btn-primary">Home</button></Link>
            {questions.map((item, key) => (
                <div style={{ marginTop: 30 }}>
                    <FormControl component="fieldset">
                        <FormLabel component="legend" key={key}>{item}</FormLabel>
                        <RadioGroup
                            aria-label="car"
                            name={item}
                            onChange={handleChange}
                        >

                            {ansMap.map((item, key) => (

                                <FormControlLabel key={key} value={item} control={<Radio />} label={item} />
                            ))}


                        </RadioGroup>

                    </FormControl>

                </div>
            ))}
            <form>
                <input type="text" id="name" name="name" placeholder="E.g. John Smith" onChange={handleRespondent} />
            </form>

            <Button variant="contained" style={{ margin: '10px' }} class="btn btn-primary" onClick={postData}>Submit</Button>

            <div style={{ marginTop: 20, color: "green" }}>{isVisible ? <i>Success</i> : null}</div>

        </div>
    );
}

export default Survey;
