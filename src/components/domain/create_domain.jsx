import React from 'react';
import Panel from '../panel.jsx';
import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx.jsx';

export default class CreateDomain extends React.Component {
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
                            placeholder='example.com'
                        />
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
                                    ref='annualRenovation'
                                />
                                <span></span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className='form-group row'>
                    <div className='col-md-8 col-md-offset-3'>
                        <div className='box-content'>
                            <div className='col-md-4 form-group required'>
                                <label
                                    htmlFor='domain_mbx_basic_limit'
                                    clasName='label-top control-label'
                                >
                                    <abbr title='Requerido'>{'*'}</abbr><br/>
                                    {'Básica'}
                                </label>

                                <br/>

                                <div className='row'>
                                    <div className='col-sm-8'>
                                        <input
                                            type='text'
                                            className='form-control'
                                            defaulValue='0'
                                            ref='plan_basica'
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='col-md-4 form-group required'>
                                <label
                                    htmlFor='domain_mbx_basic_limit'
                                    clasName='label-top control-label'
                                >
                                    <abbr title='Requerido'>{'*'}</abbr><br/>
                                    {'Profesional'}
                                </label>

                                <br/>

                                <div className='row'>
                                    <div className='col-sm-8'>
                                        <input
                                            type='text'
                                            className='form-control'
                                            defaulValue='0'
                                            ref='plan_professional'
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='col-md-4 form-group required'>
                                <label
                                    htmlFor='domain_mbx_basic_limit'
                                    clasName='label-top control-label'
                                >
                                    <abbr title='Requerido'>{'*'}</abbr><br/>
                                    {'Premium'}
                                </label>

                                <br/>

                                <div className='row'>
                                    <div className='col-sm-8'>
                                        <input
                                            type='text'
                                            className='form-control'
                                            defaulValue='0'
                                            ref='plan_premium'
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Límite de casillas'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='text'
                            className='form-control'
                            ref='mailboxLimit'
                            defaulValue='0'
                            disabled='disabled'
                        />
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
                        title={'Agregar Dominio'}
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
