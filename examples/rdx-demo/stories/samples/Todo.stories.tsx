import React from 'react';
import { RdxContext, atom, useRdxState, watcher } from '@czwcode/rdx';
import uuid from 'uuid/v1';
import 'todomvc-app-css/index.css';
export default {
  title: '场景示例/ Todo',
  parameters: {
    info: { inline: true },
  },
};

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
const todoList = atom({
  id: 'todoList',
  defaultValue: [
    { id: '1', text: '222', completed: false },
    { id: '2', text: '222', completed: true },
  ] as IToDo[],
});

const filterhStatus = atom({
  id: 'filterStatus',
  defaultValue: VisibilityFilters.SHOW_ALL,
});
const todoListByFilterStatus = watcher({
  id: 'todoListByFilterStatus',
  get: ({ get }) => {
    return get(todoList).filter((item) => {
      if (get(filterhStatus) === VisibilityFilters.SHOW_ALL) {
        return true;
      } else if (get(filterhStatus) === VisibilityFilters.SHOW_ACTIVE) {
        return !item.completed;
      } else {
        return item.completed;
      }
    });
  },
});
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

const TodoList = () => {
  const [todos, setTodo] = useRdxState(todoList);
  const [todosByFilter] = useRdxState(todoListByFilterStatus);
  console.log('todosByFilter: ', todosByFilter);
  return (
    <ul className='todo-list'>
      {todosByFilter.map((todo, index) => (
        <Todo
          key={todo.id}
          {...todo}
          onDelete={() => {
            setTodo(
              todos.splice(
                todos.findIndex((item) => item.id === todo.id),
                1
              )
            );
          }}
          onItemClick={() => {
            setTodo([
              ...todos.slice(0, index),
              { ...todo, completed: !todo.completed },
              ...todos.slice(index + 1),
            ]);
          }}
        />
      ))}
    </ul>
  );
};
const FilterItem = ({ active, children, onClick }) => (
  <li
    onClick={onClick}
    style={{
      marginLeft: '4px',
    }}
  >
    <a className={active ? 'selected' : ''}>{children}</a>
  </li>
);
const FilterList = () => {
  const datas = [
    { label: 'All', value: VisibilityFilters.SHOW_ALL },
    { label: 'Active', value: VisibilityFilters.SHOW_ACTIVE },
    { label: 'Completed', value: VisibilityFilters.SHOW_COMPLETED },
  ];
  const [status, setStatus] = useRdxState(filterhStatus);
  return (
    <footer
      className='footer'
      style={{ boxSizing: 'content-box', display: 'flex' }}
    >
      <ul className='filters'>
        {datas.map((item) => {
          return (
            <FilterItem
              active={item.value === status}
              onClick={() => {
                setStatus(item.value);
              }}
            >
              {item.label}
            </FilterItem>
          );
        })}
      </ul>
    </footer>
  );
};

const AddButton = () => {
  const [state, setState] = useRdxState(todoList);
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <input style={{ width: 40, height: 40, opacity: 0}} checked={true} className='toggle' type='checkbox'></input>
      <input
        onKeyDown={(e: any) => {
          const text = e.target.value.trim();
          if (e.which === 13) {
            setState(
              state.concat({
                id: uuid(),
                text: text,
                completed: false,
              })
            );
            e.target.value = '';
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        className='new-todo'
        placeholder='What needs to be done?'
      />
    </div>
  );
};
export const ToDo = () => {
  return (
    <div className='todoapp'>
      <RdxContext>
        <h1>todos</h1>
        {/* <DevVisualTableTool /> */}
        <AddButton />
        <TodoList />
        <FilterList />
        {/* <DevVisualGraphTool /> */}
      </RdxContext>
    </div>
  );
};
