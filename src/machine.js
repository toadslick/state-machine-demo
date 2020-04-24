import { Machine, assign } from 'xstate';


const mockRequest = (value, match) =>
  new Promise((resolve, reject) => {
    setTimeout(value === match ? resolve : reject, 3000)
  });

const loginMachine = Machine({
  id: 'login',
  initial: 'inputEmail',
  context: {
    email: '',
    password: '',
    tfa: '',
    tfaEnabled: false,
  },
  states: {

    inputEmail: {
      on: {
        CHANGE: {
          actions: ['updateEmail'],
        },
        SUBMIT: {
          target: 'submitEmail'
        },
      },
    },

    submitEmail: {
      on: {
        CANCEL: {
          target: 'inputEmail'
        },
      },
      invoke: {
        id: 'emailRequest',
        src: 'email',
        onDone: {
          target: 'inputPassword',
        },
        onError: {
          target: 'inputEmail',
        },
      },
    },

    inputPassword: {
      on: {
        BACK: {
          target: 'inputEmail',
        },
        CHANGE: {
          actions: ['updatePassword'],
        },
        SUBMIT: {
          target: 'submitPassword'
        },
      },
    },

    submitPassword: {
      on: {
        CANCEL: {
          target: 'inputPassword'
        },
      },
      invoke: {
        id: 'passwordRequest',
        src: 'password',
        onDone: [
          {
            target: 'inputTfa',
            cond: 'isTfaEnabled',
          },
          {
            target: 'success',
          },
        ],
        onError: {
          target: 'inputPassword',
        },
      },
    },

    inputTfa: {
      on: {
        BACK: {
          target: 'inputPassword',
        },
        CHANGE: {
          actions: ['updateTfa'],
        },
        SUBMIT: {
          target: 'submitTfa'
        },
      },
    },

    submitTfa: {
      on: {
        CANCEL: {
          target: 'inputTfa'
        },
      },
      invoke: {
        id: 'tfaRequest',
        src: 'tfa',
        onDone: {
          target: 'success',
        },
        onError: {
          target: 'inputTfa',
        },
      },
    },

    success: {
      type: 'final'
    },
  },

  on: {
    TOGGLE_TFA: {
      actions: ['toggleTfa'],
    }
  }
}, {

  actions: {
    updateEmail: assign({
      email: (context, event) => event.data
    }),
    updatePassword: assign({
      password: (context, event) => event.data
    }),
    updateTfa: assign({
      tfa: (context, event) => event.data
    }),
    toggleTfa: assign({
      tfaEnabled: context => !context.tfaEnabled
    }),
  },

  services: {
    email: context => mockRequest(context.email, 'email@example.com'),
    password: context => mockRequest(context.password, 'password'),
    tfa: context => mockRequest(context.tfa, '123456'),
  },

  guards: {
    isTfaEnabled: context => !!context.tfaEnabled,
  }
});

export default loginMachine;
