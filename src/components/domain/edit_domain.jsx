import React from 'react';
import Panel from '../panel.jsx';
import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx.jsx';

export default class EditDomain extends React.Component {
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
                        title={'Editar Dominio'}
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
