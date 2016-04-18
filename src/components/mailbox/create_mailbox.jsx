import React from 'react';
import {browserHistory} from 'react-router';
import Panel from '../panel.jsx';
import Button from '../button.jsx';

export default class CreateMailBox extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

        this.state = {
            notification: false,
            notificationMsg: ''
        };
    }

    componentDidMount() {
        $('#selectDomains').select2({
            placeholder: 'Por favor, introduzca 3 caracteres.',
            allowClear: true
        });
    }

    handleClick(e, path) {
        e.preventDefault();

        browserHistory.push(path);
    }

    render() {
        let form = (
            <form className='simple_form form-horizontal mailbox-form'>
                <div className='form-group string required'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='requerido'>{'*'}</abbr>
                        {'Dirección'}
                    </label>

                    <div className='col-sm-8'>
                        <div className='row'>
                            <div className='col-xs-6'>
                                <input
                                    type='text'
                                    required='required'
                                    className='form-control'
                                    ref='address'
                                />
                            </div>
                            <div className='col-xs-6'>
                                <div className='input-group'>
                                    <span className='input-group-addon'>{'@'}</span>
                                    <select
                                        className='form-control'
                                        id='selectDomains'
                                        ref='domain'
                                    >
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Nombre'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            ref='name'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Apellido'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            ref='lastname'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Descripción'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            ref='description'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Chat'}
                    </label>

                    <div className='col-sm-8'>
                        <label className='radio-inline pretty-input'>
                            <div className='pretty-checkbox'>
                                <input
                                    type='checkbox'
                                    className='pretty'
                                    ref='hasChat'
                                />
                                <span></span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Administrador delegado'}
                    </label>

                    <div className='col-sm-8'>
                        <label className='radio-inline pretty-input'>
                            <div className='pretty-checkbox'>
                                <input
                                    type='checkbox'
                                    className='pretty'
                                    ref='isAdministrator'
                                />
                                <span></span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='Requerido'>{'*'}</abbr>
                        {'Tipo de casilla'}
                    </label>

                    <div className='col-sm-8'>
                        <label className='radio radio-info radio-inline pretty-input'>
                            <div className='pretty-radio'>
                                <input
                                    type='radio'
                                    className='pretty'
                                    name='mailbox'
                                    ref='mailbox_basic'
                                />
                                <span></span>
                            </div>
                            {'Básica'}
                        </label>

                        <label className='radio radio-info radio-inline pretty-input'>
                            <div className='pretty-radio'>
                                <input
                                    type='radio'
                                    className='pretty'
                                    name='mailbox'
                                    ref='mailbox_professional'
                                />
                                <span></span>
                            </div>
                            {'Profesional'}
                        </label>

                        <label className='radio radio-info radio-inline pretty-input'>
                            <div className='pretty-radio'>
                                <input
                                    type='radio'
                                    className='pretty'
                                    name='mailbox'
                                    ref='mailbox_premium'
                                />
                                <span></span>
                            </div>
                            {'Premium'}
                        </label>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='Requerido'>{'*'}</abbr>
                        {'Contraseña'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='password'
                            className='form-control'
                            ref='passwd'
                        />
                    </div>
                </div>

                <div className='form-group'>
                    <div className='col-sm-8 col-sm-offset-3'>
                        <input
                            type='submit'
                            name='commit'
                            value='Guardar'
                            className='btn btn-primary'
                        />
                        <Button
                            btnAttrs={
                            {
                                className: 'btn btn-default',
                                onClick: (e) => {
                                    this.handleClick(e, '/mailboxes');
                                }
                            }
                            }
                        >
                            {'Cancelar'}
                        </Button>
                    </div>
                </div>
            </form>
        );

        const actions = [
            {
                label: 'Cancelar',
                props: {
                    className: 'btn btn-default btn-xs',
                    onClick: (e) => {
                        this.handleClick(e, '/mailboxes');
                    }
                }
            }
        ];

        return (
            <Panel
                title={'Agregar Casilla'}
                btnsHeader={actions}
                classHeader={'forum-box'}
            >
                {form}
            </Panel>
        );
    }
}
