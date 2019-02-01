import React from 'react';
import isEmail from 'validator/lib/isEmail';
import posed, { PoseGroup } from 'react-pose';

const hasContent = value => (value.length >= 3 ? true : false);

const validate = (value, type) =>
  (type === 'email' ? isEmail(value) : hasContent(value));

const encode = (data) => {
  return Object.keys(data)
    .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&");
}

const Message = posed.div({
  enter: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 500 },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 500 },
  },
});

export default class Form extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sent: false,
      error: false,
      type: 'General Inquiry',
      role: '',
      fName: '',
      fNameValid: null,
      lName: '',
      lNameValid: null,
      email: '',
      emailValid: null,
      message: '',
      messageValid: null,
    };
  }

  /* Here’s the juicy bit for posting the form submission */

  handleSubmit = e => {
    if (
      this.state.fNameValid &&
      this.state.lNameValid &&
      this.state.emailValid &&
      this.state.messageValid
    ) {
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "contact",
          ...this.state
        }),
      })
      .then(() => this.setState({
        sent: true,
        error: false,
        fName: '',
        fNameValid: null,
        lName: '',
        lNameValid: null,
        email: '',
        emailValid: null,
        message: '',
        messageValid: null,
      }, () => setTimeout(() => this.setState({ sent: false }), 3500)))
      .catch(() => this.setState({
        sent: false,
        error: 'Ooops... Something went wrong, please try again.',
      }));
    } else {
      this.setState(prevState => ({
        sent: false,
        error: 'Please fill out all the fields.',
        fName: prevState.name,
        fNameValid: prevState.nameValid || false,
        lName: prevState.name,
        lNameValid: prevState.nameValid || false,
        email: prevState.email,
        emailValid: prevState.emailValid || false,
        message: prevState.message,
        messageValid: prevState.messageValid || false,
      }));
    }

    e.preventDefault();
    console.log(this.state);
  };

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
      [`${e.target.name}Valid`]: validate(e.target.value, e.target.type),
    });
  }

  handleType = ({ target }) => this.setState({ type: target.value });

  handleRoles = ({ target }) =>this.setState({ role: target.value });

  render() {
    const { fName, lName, email, message, type, sent, error } = this.state;
    return (
      <form
        name="contact"
        method="POST"
        onSubmit={this.handleSubmit}
      >
        <input type="hidden" name="form-name" value="contact" />
        <p>
          <label>Your Role:
            <select onChange={this.handleRoles} name="role[]" multiple>
              <option value="leader">Leader</option>
              <option value="follower">Follower</option>
            </select>
          </label>
        </p>
        <p>
          <label htmlFor="general">
            <input
              type="radio"
              name="inquiry-type"
              value="General Inquiry"
              id="general"
              checked={type === 'General Inquiry'}
              onChange={this.handleType}
            />
            General Inquiry
          </label>
          <label htmlFor="quote">
            <input
              type="radio"
              name="inquiry-type"
              value="Request a Quote"
              id="quote"
              checked={type === 'Request a Quote'}
              onChange={this.handleType}
            />
            Request a Quote
          </label>
        </p>
        <p>
          <label>
            Your FName:
            <input type="text" name="fName" value={fName} onChange={this.handleChange} />
          </label>
        </p>
        <p>
          <label>
            Your LName:
            <input type="text" name="lName" value={lName} onChange={this.handleChange} />
          </label>
        </p>
        <p>
          <label>
            Your Email:
            <input type="email" name="email" value={email} onChange={this.handleChange} />
          </label>
        </p>
        <p>
          <label>
            Message:
            <textarea name="message" value={message} onChange={this.handleChange} />
          </label>
        </p>
        <div>
          <PoseGroup flipMove={false}>
            {sent &&
              <Message key="message-sent">
                {'Thank you for contacting us, someone will get in touch soon!'}
              </Message>
            }
            {error &&
              <Message key="message-error">
                {error}
              </Message>
            }
          </PoseGroup>
        </div>
        <p>
          <button name="submit" type="submit">Send</button>
        </p>
      </form>
    );
  }
}