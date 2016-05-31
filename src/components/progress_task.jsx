// Copyright (c) 2016 ZBox, Spa. All Rights Reserved.
// See LICENSE.txt for license information.
import React from 'react';
import EventStore from '../stores/event_store.jsx';

export default class ProgressTask extends React.Component {
    constructor(props) {
        super(props);

        this.showTasks = this.showTasks.bind(this);
        this.removeTask = this.removeTask.bind(this);

        this.tasks = [];

        this.state = {};
    }
    componentWillUnmount() {
        EventStore.removeTaskSListener(this.showTasks);
        EventStore.removeEndTaskSListener(this.removeTask);
    }

    componentDidMount() {
        EventStore.addTaskSListener(this.showTasks);
        EventStore.addEndTaskSListener(this.removeTask);
    }

    removeTask(params) {
        if (this.tasks.length > 0) {
            const arrTasks = this.tasks;
            const length = arrTasks.length;
            for (let i = 0; i < length; i++) {
                if (arrTasks[i].id === params.id) {
                    this.tasks.splice(i, 1);
                    EventStore.emitToast({
                        type: params.toast.type || 'success',
                        title: params.toast.title,
                        body: params.toast.message,
                        options: {
                            timeOut: 10000,
                            extendedTimeOut: 5000,
                            closeButton: true
                        }
                    });
                    break;
                }
            }
        }

        if (this.tasks.length < 1) {
            return this.setState({
                show: null
            });
        }

        return this.setState({
            tasks: this.tasks,
            total: this.tasks.length
        });
    }

    isTaskDuplicated(params) {
        const id = params.id;
        for (let i = 0; i < this.tasks.length; i++) {
            const currentTask = this.tasks[i];
            if (id === currentTask.id) {
                return true;
            }
        }

        return false;
    }

    showTasks(params) {
        if (this.isTaskDuplicated(params)) {
            return null;
        }

        this.tasks.push(params);

        return this.setState({
            show: true,
            tasks: this.tasks,
            total: this.tasks.length
        });
    }

    render() {
        let tasks = null;
        let show = null;
        let message = 'Acciones en ejecución';

        if (this.state.show) {
            show = 'active';
        }

        if (this.state.tasks) {
            const taskList = this.state.tasks;
            tasks = [];

            taskList.forEach((task, index) => {
                tasks.push((
                    <ul
                        key={`ul-${index}`}
                    >
                        <li>{`${task.origin} - ${task.action}`}</li>
                    </ul>
                ));
            });
        }

        if (this.state.total) {
            const multiple = (this.state.total > 1) ? 'tareas' : 'tarea';
            message = `${this.state.total} ${multiple} en ejecución`;
        }

        return (
            <div className={`progress manager-progress ${show}`}>
                <div className='taskboard alert-success'>
                    <div className='wrap-task'>
                        {tasks}
                    </div>
                </div>
                <div className={`progress-bar manager-task-bar progress-bar-striped ${show}`}>
                    {message}
                </div>
            </div>
        );
    }
}

ProgressTask.defaultProps = {
};

ProgressTask.propTypes = {
    children: React.PropTypes.oneOfType([
        React.PropTypes.arrayOf(React.PropTypes.element),
        React.PropTypes.element
    ])
};
