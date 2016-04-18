//import $ from 'jquery';
//import select2 from 'select2';
import React from 'react';
import {browserHistory} from 'react-router';
import Panel from '../panel.jsx';
import Button from '../button.jsx';

export default class EditMailBox extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);
        this.handleClickDelete = this.handleClickDelete.bind(this);

        this.state = {
            notification: false,
            notificationMsg: ''
        };
    }

    handleClick(e, path) {
        e.preventDefault();

        browserHistory.push(path);
    }

    handleClickDelete(e) {
        e.preventDefault();
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
            },
            {
                label: 'Eliminar',
                props: {
                    className: 'btn btn-danger btn-xs',
                    onClick: (e) => {
                        this.handleClickDelete(e, '/mailboxes/delete/1');
                    }
                }
            }
        ];

        return (
            <Panel
                title={'Editar Casilla'}
                btnsHeader={actions}
                classHeader={'forum-box'}
            >
                {form}
            </Panel>
        );
    }
}
