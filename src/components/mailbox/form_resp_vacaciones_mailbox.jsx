import React from 'react';
import Button from '../button.jsx';

export default class FormVacacionesMailbox extends React.Component {
    constructor(props) {
        super(props);

        this.handleSaveAutoResp = this.handleSaveAutoResp.bind(this);
    }

    handleSaveAutoResp() {
        console.log('save'); //eslint-disable-line no-console
    }

    render() {
        return (
            <form
                className='simple_form form-horizontal mailbox-form'
                onSubmit={(e) => {
                    this.handleSubmit(e);
                }}
                id='createAccount'
            >
                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Habilitado'}
                    </label>

                    <div className='col-sm-8'>
                        <label className='radio-inline pretty-input'>
                            <div className='pretty-checkbox'>
                                <input
                                    type='checkbox'
                                    className='pretty'
                                    ref='habilitado'
                                />
                                <span></span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Termina el'}
                    </label>

                    <div className='col-sm-8'>
                        <input
                            type='password'
                            className='form-control'
                            ref='endsAt'
                            id='endsAt'
                        />
                    </div>
                </div>

                <div className='form-group string'>
                    <label className='string required col-sm-3 control-label'>
                        {'Respuesta'}
                    </label>

                    <div className='col-sm-8'>
                        <textarea
                            name='response'
                            id='responseBox'
                            className='form-control'
                            rows='4'
                            ref='respVacaciones'
                        >
                        </textarea>
                    </div>
                </div>

                <div className='form-group'>
                    <div className='col-xs-8 col-sm-offset-2'>
                        <Button
                            btnAttrs={
                                {
                                    className: 'btn btn-info',
                                    onClick: () => {
                                        this.handleSaveAutoResp();
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
    }
}
