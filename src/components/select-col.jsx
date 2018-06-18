import React from 'react';
import PropTypes from 'prop-types';

export default class SelectCol extends React.Component {
    constructor(props) {
        super(props);

        this.options = this.props.options;
        this.disabledOptions = this.props.disabledOptions;
        this.current = this.props.selected;

        this.state = {
            options: this.options
        };
    }

    handleSelectChange(e, id) {
        const current = this.current;
        e.preventDefault();
        if (this.props.onSelected) {
            const option = e.target;
            let selected = option.options[option.options.selectedIndex].text;
            const restart = option.options[option.options.selectedIndex].hasAttribute('data-main');
            if (selected) {
                if (restart) {
                    selected = {
                        restart: this.current
                    };
                    this.current = null;
                } else {
                    this.current = selected;
                }
                return this.props.onSelected(e, current, selected, id);
            }
            return null;
        }

        return null;
    }

    componentWillUnmount() {
        this.setState({
            options: null
        });
    }

    render() {
        let options = null;
        const current = this.current;

        if (this.state.options) {
            const optionElement = this.state.options;
            options = [];

            options.push((
                <option
                    key='header-option'
                    data-main={'true'}
                >
                    {'Columna'}
                </option>
            ));

            for (const option in optionElement) {
                if (optionElement.hasOwnProperty(option)) {
                    const isDisabled = (this.disabledOptions[option]) ? 'disabled' : null;

                    options.push((
                        <option
                            value={optionElement[option]}
                            key={`${option}-option`}
                            disabled={isDisabled}
                        >
                            {option}
                        </option>
                    ));
                }
            }
        }

        return (
            <select
                {...this.props.selectAttrs}
                onChange={(e) => {
                    this.handleSelectChange(e, this.props.id);
                }}
                defaultValue={current}
            >
                {options}
            </select>
        );
    }
}

SelectCol.propTypes = {
    options: PropTypes.object.isRequired,
    selectAttrs: PropTypes.object,
    onSelected: PropTypes.func,
    disabledOptions: PropTypes.object,
    selected: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.bool
    ]),
    id: PropTypes.any.isRequired
};

SelectCol.defaultProps = {
    options: []
};
