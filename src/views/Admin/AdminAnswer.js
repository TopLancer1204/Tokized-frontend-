import React, { useEffect, useCallback, useState, useRef } from "react";
import { Button, Layout, Notification, Form, Input, Select, Checkbox } from "element-react";
import Fade from "react-reveal/Fade";
import { Table as TableBs } from 'react-bootstrap';
import { callPost, callGet } from "../../services/axios";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

const questionCard = {
    padding: "10px",
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
    borderRadius: "5px",
    backgroundColor: 'white'
}

const answerCard = {
    padding: "7px"
}

const AdminAnswer = () => {

    const [items, setItems] = useState([]);
    const [pageData, setPageData] = useState([]);
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        callGet('/api/admin/getAnswers')
        .then(res => {
            setItems(res.data.items)
        })
        .catch(err => {
            console.log("[error", err)
        })
        callGet('/api/admin/getQuestions')
        .then(res => {
            setQuestions(res.data.fields);
        })
        .catch(err => {
            console.log('[Update Failed]', err);
        })
    }, [])

    const onAnswerClick = (item) => {
        var datas = []
        questions.map((question) => {
            var onePair = {title: question.title, answer: ""}
            for (var obj of item) {
                if (question.id == obj.field.id) {
                    onePair.answer = obj[obj.type]?.label ? obj[obj.type]?.label: obj[obj.type];
                    onePair.answer = obj[obj.type]?.id == 'other' ? obj[obj.type]?.other : onePair.answer;
                    onePair.answer = obj[obj.type]?.labels ? obj[obj.type]?.labels: onePair.answer;
                    break;
                }
            }
            datas.push(onePair);
        });
        setPageData(datas);
    }

    const renderResponseSection = (item, index) => {
        return (
            <div key={index}>
                <div style={questionCard}>
                    {item.title}
                </div>
                { Array.isArray(item.answer) ? item.answer.map(obj => {
                    return <div style={answerCard}>
                        <li>{obj}</li>
                    </div>
                }): <div style={answerCard}>
                <li>{item.answer}</li>
            </div>}
                
            </div>
        )
    }

    const printToPdf = () => {
        const input = document.getElementById('contentPdf');
        html2canvas(input)
            .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'JPEG', 0, 0);
            // pdf.output('dataurlnewwindow');
            pdf.save("download.pdf");
        })
    }

    return (
        <>
            <div className="d-flex flex-column justify-content-center align-items-center overflow-hidden">
                <div style={{ width: '80%' }} >
                    <Fade bottom delay={200}>
                        <h1 style={{ textAlign: "center" }} className='d-font-bold d-text-90 d-white'>Answers</h1>
                        <br /><br />
                        <div className="grid-content d-content-highlight d-flex" style={{ borderRadius: "5px 5px 1px 1px", fontSize: 25 }}>
                            <div className="ms-3">Answers</div>
                        </div>
                        <Layout.Row className='d-flex' style={{ padding: "10px" }}>
                            <Layout.Col sm="24" md={9}>
                                <TableBs striped hover variant="dark" style={{ margin: 0 }} className="text-center">
                                    <thead>
                                        <tr>
                                            <th className="bg-secondary">#</th>
                                            <th className="bg-secondary" style={{ minWidth: 130 }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => {
                                            return (
                                                <tr key={index} onClick={() => onAnswerClick(item.answers)} style={{ cursor: 'pointer' }}>
                                                    <td>{index + 1}</td>
                                                    <td>Answer #{item.response_id}</td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </TableBs>
                            </Layout.Col>
                            <Layout.Col sm="24" md={1}></Layout.Col>
                            <Layout.Col sm="24" md={14} >
                                <Button onClick={printToPdf}>PRINT WITH PDF</Button>
                                <div style={{ borderRadius: 5, padding: '20px' }} id="contentPdf">
                                    {pageData.map((item, index) => renderResponseSection(item, index))}
                                </div>
                            </Layout.Col>
                        </Layout.Row>
                    </Fade>
                </div>
            </div>
        </>
    )
}

export default AdminAnswer;