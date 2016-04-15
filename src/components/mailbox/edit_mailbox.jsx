//import $ from 'jquery';
//import select2 from 'select2';
import React from 'react';
import Panel from '../panel.jsx';
import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx';

export default class EditMailBox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            notification: false,
            notificationMsg: ''
        };
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
                                />
                            </div>
                            <div className='col-xs-6'>
                                <div className='input-group'>
                                    <span className='input-group-addon'>{'@'}</span>
                                    <select
                                        className='form-control'
                                        id='selectDomains'
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
                                />
                                <span></span>
                            </div>
                            {'Premium'}
                        </label>
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
                        <Button btnAttrs={{href: './cancel', className: 'btn btn-default'}}>
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
                    href: '/mailboxes'
                }
            },
            {
                label: 'Eliminar',
                props: {
                    className: 'btn btn-danger btn-xs',
                    href: '/delete'
                }
            }
        ];

        return (
            <div className='content animate-panel'>
                {this.state.notification && (
                    <MessageBar
                        message={this.state.notificacionMsg}
                        type='error'
                        position='relative'
                        canClose={false}
                    />
                )}

                <div className='col-lg-12'>
                    <Panel
                        title={'Editar Casilla'}
                        btnsHeader={actions}
                        classHeader={'forum-box'}
                    >
                        {form}
                    </Panel>
                </div>
            </div>
        );
    }
}
