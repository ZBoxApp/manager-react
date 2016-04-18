import React from 'react';
import {browserHistory} from 'react-router';
import Panel from '../panel.jsx';
import Button from '../button.jsx';

export default class CreateAccount extends React.Component {
    constructor(props) {
        super(props);

        this.handleClick = this.handleClick.bind(this);

        this.state = {
            notification: false,
            notificationMsg: ''
        };
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
                        {'Nombre'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            required='required'
                            className='form-control'
                            ref='companyName'
                            placeholder='Razón social de la empresa'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='requerido'>{'*'}</abbr>
                        {'ID Cliente'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control select required'
                            required='required'
                            ref='idclient'
                            placeholder='Ingresa el RUT de la empresa (xxxxxxxx-y)'
                        >

                        </input>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Reseller'}
                    </label>

                    <div className='col-sm-8'>
                        <label className='radio-inline pretty-input'>
                            <div className='pretty-checkbox'>
                                <input
                                    type='checkbox'
                                    className='pretty'
                                    ref='reseller'
                                />
                                <span></span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className='form-group'>
                    <div className='col-sm-8 col-sm-offset-3'>
                        <input
                            type='submit'
                            name='commit'
                            defaulValue='Guardar'
                            className='btn btn-info'
                        />
                        <Button
                            btnAttrs={
                            {
                                className: 'btn btn-default',
                                onClick: (e) => {
                                    this.handleClick(e, '/accounts');
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
                        this.handleClick(e, '/accounts');
                    }
                }
            }
        ];

        return (
            <Panel
                title={'Agregar Cuenta'}
                btnsHeader={actions}
                classHeader={'forum-box'}
            >
                {form}
            </Panel>
        );
    }
}
