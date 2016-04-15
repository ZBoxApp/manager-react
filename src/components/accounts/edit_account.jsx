import React from 'react';
import Panel from '../panel.jsx';
import Button from '../button.jsx';
import MessageBar from '../message_bar.jsx';

export default class EditAccount extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            notification: false,
            notificacionMsg: ''
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
                        title={'Editar Cuenta'}
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
