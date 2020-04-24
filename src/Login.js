import React from 'react';
import { useMachine } from '@xstate/react';
import loginMachine from './machine';

const Form = ({ type, label, value, onChange, onSubmit }) => (
  <form onSubmit={onSubmit}>
    <label>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        ref={el => el && el.focus()}
      />
    </label>
    <button>Submit</button>
  </form>
);

const Busy = ({ label, onCancel}) => (
  <>
    <p>{label}</p>
    <button onClick={onCancel}>Cancel</button>
  </>
);

const Login = () => {
  const [state, send] = useMachine(loginMachine);

  const {
    context: { email, password, tfa, tfaEnabled },
    value
  } = state;

  const onChange = event => send('CHANGE', { data: event.target.value });
  const onSubmit = () => send('SUBMIT');
  const onCancel = () => send('CANCEL');
  const onBack = () => send('BACK');

  switch (value) {
    case 'inputEmail':
      return (
        <>
          <Form
            type="text"
            label="Email"
            value={email}
            onChange={onChange}
            onSubmit={onSubmit}
          />
          <hr/>
          <button onClick={() => send('TOGGLE_TFA')}>
            { tfaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </>
      );

    case 'submitEmail':
      return <Busy label="Submitting email..." onCancel={onCancel} />

    case 'inputPassword':
      return (
        <>
          <button onClick={onBack}>&lt; Back</button>
          <Form
            type="password"
            label="Password"
            value={password}
            onChange={onChange}
            onSubmit={onSubmit}
          />
        </>
      );

    case 'submitPassword':
      return <Busy label="Submitting password..." onCancel={onCancel} />

    case 'inputTfa':
      return (
        <>
          <button onClick={onBack}>&lt; Back</button>
          <Form
            type="text"
            label="Two-factor auth"
            value={tfa}
            onChange={onChange}
            onSubmit={onSubmit}
          />
        </>
      );

    case 'submitTfa':
      return <Busy label="Submitting two-factor auth..." onCancel={onCancel} />

    case 'success':
      return <p>Successfully logged in as {email}.</p>

    default:
      return null;
  }
}

export default Login;
