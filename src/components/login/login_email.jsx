// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

export default class LoginEmail extends React.Component {
    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            loginError: props.loginError
        };
    }
    componentWillReceiveProps(nextProps) {
        this.setState({loginError: nextProps.loginError});
    }
    handleSubmit(e) {
        e.preventDefault();
        var state = {};

        const email = this.refs.email.value.trim();
        if (!email) {
            state.loginError = 'El correo electrónico es obligatorio';
            this.setState(state);
            return;
        }

        const password = this.refs.password.value.trim();
        if (!password) {
            state.loginError = 'La contraseña es obligatoria';
            this.setState(state);
            return;
        }

        state.loginError = '';
        this.setState(state);

        this.props.submit(email, password);
    }
    render() {
        let loginError;
        let errorClass = '';
        if (this.state.loginError) {
            loginError = <label className='control-label'>{this.state.loginError}</label>;
            errorClass = ' has-error';
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <div className='signup__email-container'>
                    <div className={'form-group' + errorClass}>
                        {loginError}
                    </div>
                    <div className={'form-group' + errorClass}>
                        <input
                            autoFocus={true}
                            type='email'
                            className='form-control'
                            name='email'
                            ref='email'
                            placeholder='Correo electrónico'
                            spellCheck='false'
                        />
                    </div>
                    <div className={'form-group' + errorClass}>
                        <input
                            autoFocus={false}
                            type='password'
                            className='form-control'
                            name='password'
                            ref='password'
                            placeholder='Contraseña'
                            spellCheck='false'
                        />
                    </div>
                    <div className='form-group'>
                        <button
                            type='submit'
                            className='btn btn-primary'
                        >
                            {'Iniciar Sesión'}
                        </button>
                    </div>
                </div>
            </form>
        );
    }
}
LoginEmail.defaultProps = {
};

LoginEmail.propTypes = {
    submit: React.PropTypes.func.isRequired,
    loginError: React.PropTypes.string
};
