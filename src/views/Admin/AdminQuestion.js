import React, { useEffect, useCallback, useState, useRef } from "react";
import { Button, Layout, Notification, Form, Input, Select, Checkbox } from "element-react";
import Fade from "react-reveal/Fade";
import { useDrag, useDrop } from 'react-dnd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import update from 'immutability-helper'
import { v4 as uuidv4 } from 'uuid';
import { callPost, callGet } from "../../services/axios";

var allQuestionsData = {}

const AdminQuestion = () => {

  const [type, setType] = useState("Create");
  const [questions, setQuestions] = useState([]);
  const [quesId, setQuesId] = useState([]);

  const [form, setForm] = useState({});

  const updateQuestions = () => {
    callPost('/api/admin/updateOrderQuestions', allQuestionsData)
    .then(res => {
      allQuestionsData = res.data;
      setQuestions(allQuestionsData.fields);
    }).catch(err => {
      console.log('[Update Failed]', err);
    })
  }

  useEffect(() => {
    callGet('/api/admin/getQuestions')
    .then(res => {
      allQuestionsData = res.data;
      setQuestions(allQuestionsData.fields);
    })
    .catch(err => {
      console.log('[Update Failed]', err);
    })
  }, [])

  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center overflow-hidden">
        <div style={{ width: '80%' }}>
          <Fade bottom delay={200}>
            <h1 style={{ textAlign: "center" }} className='d-font-bold d-text-90 d-white'>Questions</h1>
            <br /><br />
            <DndProvider backend={HTML5Backend} >
              <Layout.Row className='d-flex'>
                <Layout.Col sm="24" md={12}>
                  <div>
                    <Container questions={questions} upgrade={updateQuestions} setForm={setForm} setType={setType}/>
                  </div>
                </Layout.Col>
                <Layout.Col style={{ border: "2px solid #03ffa4", borderRadius: 10, backgroundColor: "#15182b" }} sm="24" md={12}>
                  <Layout.Row style={{ fontSize: 25, margin: "-1px 0px 15px 0px" }}>
                    <Layout.Col>
                      <div className="grid-content d-content-highlight d-flex" style={{ borderRadius: "5px 5px 1px 1px" }}>
                        <div className="ms-3">Question Settings</div>
                      </div>
                    </Layout.Col>
                  </Layout.Row>
                  <div style={{ padding: "10px" }}>
                    <QuestionSetting form={form} type={type} upgrade={updateQuestions} />
                  </div>
                </Layout.Col>
              </Layout.Row>
            </DndProvider>
          </Fade>
        </div>
      </div>
    </>
  )
};

export default AdminQuestion;

 const QuestionSetting = ({ form, type, upgrade }) => {

  const [choices, setChoices] = useState([]);
  const [status, setStatus] = useState(form.type);

  const rules = {
    title: [{ required: true, message: "This field is required", trigger: 'blur' }],
  };

  useEffect(() => {
    setChoices(form.properties?.choices ? form.properties?.choices : []);
    setStatus(form.type);
  }, [form])

  const renderAnswer = (item) => {
    return (
      <div style={{ display: "flex", justifyContent: "space-between" }} key={item.id}>
        <Form.Item>
          <Input defaultValue={item.label} onChange={val => onAnswerFormChange(item.id, val)}/>
        </Form.Item>
        <Button style={{ margin: '0px', height: "37px" }} onClick={() => onDelete(item.id)}><i className="el-icon-delete" /></Button>
      </div>
    )
  }

  const addChoice = () => {
    var new_choice = [...choices];
    new_choice.push({id: -1, key:uuidv4(), value:""});
    setChoices(new_choice);
  }

  const onSubmit = () => {
    if (type == "Create") {
    } else {
      allQuestionsData.fields.map(field => {
        field = field.id == form.id ? form: field;
      })
      upgrade();
    }
  }
  
  const onDelete = (id) => {
    setChoices(choices => {return choices.filter(item => item.id != id)})
    form.properties.choices = choices;
  }

  const onDeleteForm = (id) => {
    allQuestionsData.fields = allQuestionsData.fields.filter(field => field.id != id);
    upgrade();
  }

  const onOptionChnage = (val) => {
    setStatus(val);
    form.type = val;
  }

  const onAnswerFormChange = (id, label) => {
    choices.map(choice => {
      choice.label = choice.id == id ? label: choice.label
    });
    form.properties.choices = choices;
  }
  
  return (
    <>
      <Form model={form} rules={rules} labelWidth="100" labelPosition={"top"} className="d-font-bold login-ruleForm">
        <Form.Item prop="required" label=" " style={{ float: 'right' }}>
          <Checkbox checked={form.validations?.required} onChange={val => form.validations.required = val}>required</Checkbox>
        </Form.Item>
        <Form.Item label="Select Platform" prop="type">
          <Select className="w-80" value={form.type} onChange={val => onOptionChnage(val)} disabled={type == "Update" ? true : false}>
            <Select.Option value='long_text' label='Text'>Text</Select.Option>
            <Select.Option value='multiple_choice' label='Multi-choice'>Multi-choice</Select.Option>
            <Select.Option value='email' label='Email'>Email</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Text" prop="title">
          <Input defaultValue={form.title} onChange={val => form.title = val}/>
        </Form.Item>
        {status == "multiple_choice" ?
          <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {/* <Button type="primary" onClick={addChoice} style={{ height: "40px" }}>Add choice</Button> */}
              <Form.Item label=" " style={{ float: "right" }}>
                <Checkbox checked={form.properties?.allow_multiple_selection} onChange={val => form.properties.allow_multiple_selection = val} >Multiple selection</Checkbox>
              </Form.Item>
            </div>
            
            { choices.map((item) => renderAnswer(item)) }
            
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div></div>
              <Form.Item label=" ">
                <Checkbox checked={form.properties?.allow_other_choice} onChange={val => form.properties.allow_other_choice = val}>Add Other selection</Checkbox>
              </Form.Item>
            </div>
          </> : <></>
        }

        <Form.Item style={{ textAlign: "center" }}>
          <Button type="success" onClick={onSubmit}>{type}</Button>
          {type == "Update" ? <Button type="success" onClick={() =>onDeleteForm(form.id)}>Delete</Button> : <></>}
        </Form.Item>
      </Form>
    </>
  )
}

const cardStyle = {
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'move',
  borderRadius: '8px',
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)',
}

const Card = ({ id, text, index, moveCard, dropped, card, setForm, setType }) => {
  const ref = useRef(null)
  const [{ handlerId }, drop] = useDrop({
    accept: "card",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
    drop(item, monitor) {
      dropped()
    }
  })
  const [{ isDragging }, drag] = useDrag({
    type: "card",
    item: () => {
      return { id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })
  const opacity = isDragging ? 0 : 1
  drag(drop(ref))

  return (
    <div ref={ref} onClick={() => {setForm(card); setType("Update")}} style={{ ...cardStyle, opacity }} data-handler-id={handlerId}>
      {text}
    </div>
  )
}

const containerStyle = {
  width: '90%',
}

const Container = ({questions, upgrade, setForm, setType}) => {

    var orderFileds = [];
    const [cards, setCards] = useState([]);

    useEffect(() => {
      setCards(questions);
      orderFileds = questions;
    }, [questions])
    
    const moveCard = useCallback((dragIndex, hoverIndex) => {
      
      setCards((prevCards) =>
        update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex]],
          ],
        }),
      )
    }, [])

    const dropped = useCallback(() => {
      allQuestionsData.fields = orderFileds;
      upgrade();
    }, [])

    const renderCard = useCallback((card, index) => {
      orderFileds[index] = card;
      // cards.map(item => item.order = item.id == card.id ? index:item.order)
      return (
        <Card
          key={card.id}
          index={index}
          id={card.id}
          text={card.title}
          moveCard={moveCard}
          dropped={dropped}
          card={card}
          setForm={setForm}
          setType={setType}
        />
      )
    }, [])
    return (
      <>
        <div style={containerStyle}>{cards.map((card, i) => renderCard(card, i))}</div>
      </>
    )
}
