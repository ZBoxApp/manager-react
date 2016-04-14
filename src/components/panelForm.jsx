import React from 'react';

export default class PanelForm extends React.Component {
    render() {
        return (
            <form {...this.props.formAttrs}>
                <input
                    type='hidden'
                    name='utf8'
                    value='✓'
                />
                <div className='input-group'>
                    <input {...this.props.hiddenAttrs}/>
                    <input {...this.props.inputAttrs}/>
                    <span className='input-group-btn'>
                        <button
                            className='btn btn-default'
                            type='submit'
                        >
                            <span className={this.props.iconClasses}></span>
                        </button>
                    </span>
                </div>
            </form>
        );
    }
}

PanelForm.propTypes = {
    formAttrs: React.PropTypes.object,
    hiddenAttrs: React.PropTypes.object,
    inputAttrs: React.PropTypes.object,
    iconClasses: React.PropTypes.string
};

PanelForm.defaultProps = {
    iconClasses: 'fa fa-search',
    formAttrs: {name: 'search_domain'},
    hiddenAttrs: {type: 'hidden'},
    inputAttrs: {}
};
