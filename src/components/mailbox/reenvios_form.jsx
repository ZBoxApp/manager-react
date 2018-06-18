import React from 'react';
import PropTypes from 'prop-types';

import * as Client from '../../utils/client.jsx';
import EventStore from '../../stores/event_store.jsx';
import Constants from '../../utils/constants.jsx';

const messageType = Constants.MessageType;

export default class ResendForm extends React.Component {
    constructor(props) {
        super(props);

        this.onUpdateAttrs = this.onUpdateAttrs.bind(this);
        const {attrs} = this.props.mailbox;

        this.state = {
            zimbraPrefMailForwardingAddress: attrs.zimbraPrefMailForwardingAddress || '',
            zimbraMailForwardingAddress: attrs.zimbraMailForwardingAddress || ''
        };
    }

    onUpdateAttrs(e) {
        e.preventDefault();
        const {mailbox} = this.props;
        const attrs = {};
        let zimbraMailForwardingAddressTextarea = this.refs.zimbraMailForwardingAddress.value.trim();
        let zimbraPrefMailForwardingAddressInput = this.refs.zimbraPrefMailForwardingAddress.value.trim();
        let hasError = false;
        const pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (zimbraMailForwardingAddressTextarea !== '') {
            const arrayMailboxes = zimbraMailForwardingAddressTextarea.split(/\r?\n/gi);
            zimbraMailForwardingAddressTextarea = [];

            if (arrayMailboxes && arrayMailboxes.length > 0) {
                arrayMailboxes.forEach((mailbox) => {
                    if (mailbox !== '') {
                        const cleanEmail = mailbox.trim();
                        const isNotRightEmail = !pattern.test(cleanEmail);

                        if (isNotRightEmail) {
                            hasError = true;
                        } else {
                            zimbraMailForwardingAddressTextarea.push(mailbox);
                        }
                    }
                });
            }
        }

        if (zimbraPrefMailForwardingAddressInput !== '') {
            if (!pattern.test(zimbraPrefMailForwardingAddressInput)) {
                hasError = true;
            }
        }

        if (hasError) {
            return EventStore.emitToast({
                body: 'Algunas de las cuentas de correo, no tiene el formato de un correo electrónico, verifique por favor.',
                title: 'Reenvios',
                type: messageType.ERROR.toLowerCase()
            });
        }

        attrs.zimbraMailForwardingAddress = zimbraMailForwardingAddressTextarea;
        attrs.zimbraPrefMailForwardingAddress = zimbraPrefMailForwardingAddressInput;

        Client.modifyAccount(mailbox.id, attrs, () => {
            //MailboxStore.updateMailbox(data.id, mailbox, this.domain_id);
            EventStore.emitToast({
                title: 'Reenvios',
                body: 'Se han modificado los correos de reenvio éxitosamente.',
                type: messageType.SUCCESS.toLowerCase()
            });

            this.setState(attrs);
        }, (error) => {
            EventStore.emitToast({
                title: 'Reenvios',
                body: error.message,
                type: messageType.ERROR.toLowerCase()
            });
        });
    }

    renderMailbox(mailboxes) {
        const accounts = mailboxes.constructor.name === 'Array' ? mailboxes.join('\r\n') : mailboxes;
        return accounts;
    }

    render() {
        const {zimbraPrefMailForwardingAddress, zimbraMailForwardingAddress} = this.state;
        return (
            <div>
                <div className='row margin-bottom'>
                    <div className='col-xs-12'>
                        <blockquote className='custom-blockquote'>
                            <p>
                                <i>
                                    {'Direcciones de reenvío especificadas por el usuario'}
                                </i>
                            </p>
                        </blockquote>
                    </div>
                    <div className='col-xs-8'>
                        <input
                            type='text'
                            ref='zimbraPrefMailForwardingAddress'
                            className='form-control'
                            id='forwardingAddress'
                            defaultValue={this.renderMailbox(zimbraPrefMailForwardingAddress)}
                        />
                    </div>
                </div>

                <div className='row margin-bottom'>
                    <div className='col-xs-12'>
                        <blockquote className='custom-blockquote'>
                            <p>
                                <i>
                                    {'Direcciones de reenvío ocultas para el usuario'}
                                </i>
                            </p>

                            <p>
                                <i>
                                    <small>
                                        {'Separe las cuentas de correo con una nueva linea (Tecla Enter)'}
                                    </small>
                                </i>
                            </p>
                        </blockquote>
                    </div>
                    <div className='col-xs-12'>
                        <textarea
                            ref='zimbraMailForwardingAddress'
                            id='forwardingAddressHidden'
                            rows='10'
                            className='form-control noresize'
                            defaultValue={this.renderMailbox(zimbraMailForwardingAddress)}
                        >
                        </textarea>
                    </div>
                </div>

                <div className='row'>
                    <div className='col-xs-12 text-right'>
                        <button
                            className='btn btn-info'
                            onClick={this.onUpdateAttrs}
                        >
                            {'Guardar'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

ResendForm.propTypes = {
    mailbox: PropTypes.object
};
