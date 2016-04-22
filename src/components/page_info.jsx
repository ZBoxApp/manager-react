import React from 'react';

export default class PageInfo extends React.Component {
    render() {
        return (
            <div className='transition animated fadeIn small-header'>
                <div className='hpanel'>
                    <div className='panel-body'>
                        <h2 className='font-light m-b-xs'>
                            {this.props.titlePage}
                        </h2>
                        <small>{this.props.descriptionPage}</small>
                    </div>
                </div>
            </div>
        );
    }
}

PageInfo.propTypes = {
    titlePage: React.PropTypes.any.isRequired,
    descriptionPage: React.PropTypes.string
};

PageInfo.defaultProps = {
    descriptionPage: ''
};
