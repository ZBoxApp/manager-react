import React from 'react';

import Panel from './panel.jsx';
import PageInfo from './page_info.jsx';
import * as GlobalActions from '../action_creators/global_actions.jsx';

import ErrorStore from '../stores/error_store.jsx';

export default class ErrorDetails extends React.Component {
    constructor(props) {
        super(props);

        this.getDetails = this.getDetails.bind(this);

        this.state = {
            errors: null
        };
    }

    getDetails() {
        const errors = ErrorStore.getErrors();

        this.setState({
            errors
        });
    }

    componentDidMount() {
        GlobalActions.emitEndLoading();
        this.getDetails();
    }

    componentWillUnmount() {
        ErrorStore.destroy();
    }

    render() {
        const {errors} = this.state;
        let bodyError = null;
        let title;
        let message;

        if (!errors) {
            bodyError = (
                <div className='text-center'>
                    <h3 className='page-header'>
                        Por suerte no tenemos errores para mostrar <small><i className='fa fa-smile-o fa-3x color-smile'></i></small>
                    </h3>
                </div>
            );
        }

        if (errors) {
            title = errors.title;
            message = errors.message;
            const elements = [];
            const keys = Object.keys(errors.data || []);

            keys.forEach((key) => {
                errors.data[key].forEach((error, i) => {
                    elements.push(
                        (
                            <li key={`error-${i}`}>
                                {`${error.item} : ${error.error}`}
                            </li>
                        )
                    );
                });
            });

            bodyError = (
                <div className='alert alert-danger'>
                    <ul className='list-errors list-unstyled'>
                        {elements}
                    </ul>
                </div>
            );
        }

        return (
            <div>
                <PageInfo
                    titlePage={title || 'No hay errores que mostrar'}
                    descriptionPage={message || ''}
                />
                <div className='content animate-panel'>
                    <div className='row'>
                        <div className='col-md-12 central-content'>
                            <Panel
                                children={bodyError}
                                hasHeader={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
