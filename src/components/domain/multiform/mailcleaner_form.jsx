import React from 'react';
import * as Utils from '../../../utils/utils.jsx';
import {browserHistory} from 'react-router';

import DomainStore from '../../../stores/domain_store.jsx';

export default class MailCleanerForm extends React.Component {
    constructor(props) {
        super(props);

        this.addMailCleaner = this.addMailCleaner.bind(this);
        this.nextStep = this.nextStep.bind(this);
        this.handleChangeOption = this.handleChangeOption.bind(this);

        this.state = {};
    }

    nextStep() {
        if (this.props.state.step === this.props.state.total) {
            browserHistory.push(`/domains/${this.props.state.domain.id}`);
        } else {
            DomainStore.emitNextStep({
                step: ++this.props.state.step
            });
        }
    }

    handleChangeOption() {
        const isEnabledMailCleaner = this.refs.enableMailcleaner.checked;

        Utils.toggleStatusButtons('.saveMC', !isEnabledMailCleaner);
    }

    addMailCleaner() {
        const isEnabledMailCleaner = this.refs.enableMailcleaner.checked;
        return isEnabledMailCleaner;
    }

    componentDidMount() {
        Utils.toggleStatusButtons('.saveMC', true);
    }

    render() {
        const textButton = this.props.state.step === this.props.state.total ? 'Saltar y Finalizar' : 'Saltar este paso';

        return (
            <div>
                <blockquote>
                    <p>{'¿ Desea agregar su dominio '}<strong>{this.props.state.domain.name}</strong>{' a MailCleaner ?'}</p>
                </blockquote>

                <form>
                    <div className='col-xs-12'>
                        <label
                            className='radio radio-info radio-inline pretty-input'
                        >
                            <div className='pretty-checkbox'>
                                <input
                                    type='checkbox'
                                    className='pretty'
                                    name='mailbox'
                                    ref='enableMailcleaner'
                                    onChange={this.handleChangeOption}
                                />
                                <span></span>
                            </div>
                            {'Desea usar MailCleaner en su dominio: '} <strong>{this.props.state.domain.name}</strong>
                        </label>
                    </div>

                    <br/>
                    <br/>

                    <div className='col-xs-12 text-right'>
                        <button
                            type='button'
                            className='btn btn-info saveMC'
                            onClick={this.addMailCleaner}
                        >
                            {'Guardar'}
                        </button>

                        <button
                            type='button'
                            className='btn btn-info'
                            onClick={this.nextStep}
                        >
                            {textButton}
                        </button>
                    </div>
                </form>
            </div>
        );
    }
}

MailCleanerForm.propTypes = {
    state: React.PropTypes.object
};
