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

        const email = this.refs.email.value.trim();
        const password = this.refs.password.value.trim();
        this.props.submit(email, password, this.refs);
    }
    render() {
        let errorClass = '';
        if (this.state.loginError) {
            errorClass = ' has-error';
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <div className=''>
                    <h2
                        className='text-center'
                        style={{marginBottom: '50px'}}
                    >
                        {'Ingreso a ZBox Manager'}
                    </h2>
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
                            className='btn btn-success btn-block'
                            ref='submitbutton'
                        >
                            {'Ingresar'}
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
