import React from 'react';
import { RdxContext, Status, RdxView, IRdxView } from '@czwcode/rdx';
import uuid from 'uuid/v1';
import { produce } from 'immer';
import { DevVisualGraphTool, DevVisualTableTool } from '@czwcode/rdx-plugins';
import 'todomvc-app-css/index.css';
export default {
  title: '场景示例/ Todo',
  parameters: {
    info: { inline: true },
  },
};

const Todo = ({ onItemClick, onDelete, completed, text }) => (
  <li
    onClick={onItemClick}
    className='view'
    style={{
      textDecoration: completed ? 'line-through' : 'none',
    }}
  >
    <input checked={completed} className='toggle' type='checkbox'></input>
    <label>{text}</label>
    <button
      className='destroy'
      onClick={(e) => {
        e.stopPropagation();
        onDelete && onDelete();
      }}
    ></button>
  </li>
);

const TodoList = ({ todos, toggleTodo, onDelete }) => (
  <ul className='todo-list'>
    {todos.map((todo) => (
      <Todo
        key={todo.id}
        {...todo}
        onDelete={() => onDelete(todo.id)}
        onItemClick={() => toggleTodo(todo.id)}
      />
    ))}
  </ul>
);
const Link = ({ active, children, onClick }) => (
  <li
    onClick={onClick}
    style={{
      marginLeft: '4px',
    }}
  >
    <a className={active ? 'selected' : ''}>{children}</a>
  </li>
);
interface IToDo {
  id: string;
  text: string;
  completed: boolean;
}
enum VisibilityFilters {
  SHOW_ALL = 'SHOW_ALL',
  SHOW_COMPLETED = 'SHOW_COMPLETED',
  SHOW_ACTIVE = 'SHOW_ACTIVE',
}

enum View {
  List = 'List',
  Add = 'Add',
  Filter = 'Filter',
}
enum ListAction {
  Add = 'Add',
  Remove = 'Remove',
  ChangeStatus = 'ChangeStatus',
  ChangeAllStatus = 'ChangeAllStatus',
}
const Filter = () => {
  return (
    <RdxView<VisibilityFilters, [IToDo[]], any>
      id={View.Filter}
      defaultValue={VisibilityFilters.SHOW_ALL}
      render={(context) => {
        const { next: updateState, next, value, status } = context;
        if (status === Status.FirstRender) {
          return '';
        }
        const links = [
          { label: 'All', value: VisibilityFilters.SHOW_ALL },
          { label: 'Active', value: VisibilityFilters.SHOW_ACTIVE },
          { label: 'Completed', value: VisibilityFilters.SHOW_COMPLETED },
        ];
        return (
          <footer
            className='footer'
            style={{ boxSizing: 'content-box', display: 'flex' }}
          >
            <ul className='filters'>
              {links.map((item) => (
                <Link
                  active={value === item.value}
                  onClick={() => {
                    next(item.value);
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </ul>
          </footer>
        );
      }}
    />
  );
};
const AddButton = () => {
  return (
    <RdxView<IToDo[], any, any>
      id={View.Add}
      defaultValue={[]}
      render={(context) => {
        const { next, dispatchById } = context;
        return (
          <input
            onKeyDown={(e: any) => {
              const text = e.target.value.trim();
              if (e.which === 13) {
                dispatchById(View.List, {
                  type: ListAction.Add,
                  payload: {
                    id: uuid(),
                    text: text,
                    completed: false,
                  },
                });
                e.target.value = '';
                e.stopPropagation();
                e.preventDefault();
              }
            }}
            className='new-todo'
            placeholder='What needs to be done?'
          />
        );
      }}
    />
  );
};
const List = () => {
  const listRef = React.useRef<
    IRdxView<{ dataSource: IToDo[] }, [VisibilityFilters], any>
  >({
    id: View.List,
    defaultValue: {
      dataSource: [
        { id: '1', text: '222', completed: false },
        { id: '2', text: '222', completed: true },
      ],
    },
    reducer: (state, action, context) => {
      const newState = produce(state, (state) => {
        switch (action.type) {
          case ListAction.Add:
            state.dataSource.push(action.payload);
            break;
          case ListAction.Remove:
            state.dataSource.splice(
              state.dataSource.findIndex(
                (item) => item.id === action.payload.id
              ),
              1
            );
            break;
          case ListAction.ChangeAllStatus:
            const completedCount = state.dataSource.filter(
              (item) => item.completed
            ).length;
            if (state.dataSource.length === completedCount) {
              state.dataSource = state.dataSource.map((item) => ({
                ...item,
                completed: false,
              }));
            } else {
              state.dataSource = state.dataSource.map((item) => ({
                ...item,
                completed: true,
              }));
            }
            break;
          case ListAction.ChangeStatus:
            const status =
              state.dataSource[
                state.dataSource.findIndex(
                  (item) => item.id === action.payload.id
                )
              ].completed;
            const findIndex = state.dataSource.findIndex(
              (item) => item.id === action.payload.id
            );
            state.dataSource[findIndex].completed = !status;
            break;
          default:
            break;
        }
      });
      return newState;
    },
    deps: [{ id: View.Filter }],
    render: (context) => {
      const { value = {} as any, depsValues, status, dispatch } = context;
      if (status === Status.FirstRender) {
        return '';
      }
      const { dataSource = [] } = value;
      const [filterSource] = depsValues;
      const completedCount = dataSource.filter((item) => item.completed).length;
      const todosCount = dataSource.length;
      return (
        <div style={{ position: 'relative' }}>
          {!!todosCount && (
            <span>
              <input
                className='toggle-all'
                type='checkbox'
                checked={completedCount === todosCount}
                readOnly
              />
              <label
                onClick={() => {
                  dispatch({
                    type: ListAction.ChangeAllStatus,
                  });
                }}
              />
            </span>
          )}
          <TodoList
            todos={dataSource.filter((item) => {
              if (filterSource === VisibilityFilters.SHOW_ALL) {
                return true;
              } else if (filterSource === VisibilityFilters.SHOW_ACTIVE) {
                return !item.completed;
              } else {
                return item.completed;
              }
            })}
            onDelete={(id) => {
              dispatch({
                type: ListAction.Remove,
                payload: {
                  id: id,
                },
              });
            }}
            toggleTodo={(id) => {
              dispatch({
                type: ListAction.ChangeStatus,
                payload: {
                  id: id,
                },
              });
            }}
          />
        </div>
      );
    },
  });
  return (
    <RdxView<{ dataSource: IToDo[] }, [VisibilityFilters], any>
      {...listRef.current}
    />
  );
};
export const ToDo = () => {
  return (
    <div className='todoapp'>
      <RdxContext>
        <h1>todos</h1>
        {/* <DevVisualTableTool /> */}
        <AddButton />
        <List />
        <Filter />
        {/* <DevVisualGraphTool /> */}
      </RdxContext>
    </div>
  );
};
