import React from 'react';
import {browserHistory} from 'react-router';
import Panel from '../panel.jsx';
import Button from '../button.jsx';

export default class EditDomain extends React.Component {
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
                            ref='domainName'
                            value='dominio.com'
                            disabled='disabled'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Última Renovación'}
                    </label>

                    <div className='col-sm-8'>
                        <div className='input-group date datetimepicker'>
                            <input
                                type='text'
                                className='form-control'
                                ref='lastRenovation'
                            />
                            <span className='input-group-btn'>
                                <button
                                    className='btn btn-default'
                                    type='button'
                                >
                                    <span className='fa fa-calendar'></span>
                                </button>
                            </span>
                        </div>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='requerido'>{'*'}</abbr>
                        {'Cuenta'}
                    </label>

                    <div className='col-sm-8'>
                        <select
                            className='form-control select required'
                            required='required'
                            ref='account'
                        >

                        </select>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        <abbr title='requerido'>{'*'}</abbr>
                        {'Equipo Chat'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            ref='chatTeam'
                            placeholder='Nombre (solo letras o números, no guiones bajos)'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Renovación Anual'}
                    </label>

                    <div className='col-sm-8'>
                        <label className='radio-inline pretty-input'>
                            <div className='pretty-checkbox'>
                                <input
                                    type='checkbox'
                                    className='pretty'
                                    ref='autoRenovation'
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
                            value='Guardar'
                            className='btn btn-info'
                        />
                        <Button
                            btnAttrs={
                            {
                                className: 'btn btn-default',
                                onClick: (e) => {
                                    this.handleClick(e, '/domains');
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
                        this.handleClick(e, '/domains');
                    }
                }
            }
        ];

        return (
            <Panel
                title={'Editar Dominio'}
                btnsHeader={actions}
                classHeader={'forum-box'}
            >
                {form}
            </Panel>
        );
    }
}
