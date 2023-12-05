const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo')
const middleware = require('../middleware/middleware')


// create Todo 
router.post('/create', middleware, async (req, resp) => {
    const { title, description } = req.body

    if (!title || !description) {
        return resp.status(400).json({ 'message': 'Please provide title and description' })
    }

    const todo = new Todo({
        author: req.user.id, title, description
    })

    await todo.save()

    return resp.status(200).json({ 'message': 'Todo created successfully', 'todo': todo });
})


// get all todos
router.get('/gettodos/', middleware, async (req, resp) => {
    try {
        const searchQuery = req.query.search || ''; 

        const allTodos = await Todo.find({ author: req.user.id , softDelete: false, isCompleted: false});

        const filteredTodos = searchQuery ?
            allTodos.filter(todo =>
            (todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                todo.description.toLowerCase().includes(searchQuery.toLowerCase()))
            ) : allTodos;

        if (filteredTodos.length > 0) {
            return resp.status(200).json({ message: 'Your matching Todos', todos: filteredTodos });
        } else {
            return resp.status(200).json({ message: 'No matching todos' });
        }
    } catch (error) {
        console.error(error);
        return resp.status(500).json({ message: 'Oops, some error occurred' });
    }
});


// getsoftDeleted
router.get('/getsoftDeleted', middleware, async (req, resp) => {
    try {

        const allTodos = await Todo.find({ author: req.user.id });

        const deactiveTodos = allTodos.filter(todo => todo.softDelete);

        if (deactiveTodos.length > 0) {
            return resp.status(200).json({ message: 'Your deactive Todos', todos: deactiveTodos });
        } else {
            return resp.status(200).json({ message: 'No deactive  Found' });
        }
    } catch (error) {
        console.error(error);
        return resp.status(500).json({ message: 'Oops, some error occurred' });
    }
})


// softDeleteTodo
router.put('/softDeleteTodo/:todo', middleware, async (req, resp) => {
    try {
      const todoId = req.params.todo;
  
      const todo = await Todo.findOne({ _id: todoId, author: req.user.id });
  
      if (todo) {
        todo.softDelete = true;
        await todo.save();
  
        return resp.status(200).json({ message: 'Successfully softDeleted the todo' });
      }
  
      return resp.status(404).json({ message: 'Could not find that todo' });
    } catch (error) {
      console.error(error);
      return resp.status(500).json({ message: 'Oops, some error occurred' });
    }
  });
  


// restore Todo
router.put("/restoretodo/:todo", middleware, async (req, res) => {
    try {
        const todo_id = req.params.todo

        const todos = await Todo.find({ author: req.user.id })

        if (todos) {
            const todo = await Todo.findOne({ _id: todo_id })

            if (todo) {
                todo.softDelete = false

                await todo.save()

                return res.status(200).json({ message: 'Todo restored successfully' })
            }
            else {
                return res.status(404).json({ message: 'Todo not Found' })
            }
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Oops some error occourred' })
    }
})


router.delete('/deletetodo/:todo', middleware, async (req, res) => {
    try {
        const todo_id = req.params.todo;

        const todos = await Todo.find({ author: req.user.id });

        if (todos && todos.length > 0) {
            const todo = await Todo.findOneAndDelete({ _id: todo_id, $or: [{ softDelete: true }, { isCompleted: true }] });
            if (!todo) {
                return res.status(400).json({ message: 'Todo not found' });
            }

            return res.status(200).json({ message: 'Todo deleted successfully' });
        } else {
            return res.status(400).json({ message: 'No todos found for the user' });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Oops! Some error occurred while deleting' });
    }
});


// Complete Todo
router.put('/completetodo/:todo', middleware, async (req, resp) => {
    try {
        const todoId = req.params.todo;

        const todo = await Todo.findOne({ _id: todoId, author: req.user.id });

        if (todo) {
            todo.isCompleted = true;
            await todo.save();

            return resp.status(200).json({ message: 'Successfully completed the todo' });
        }

        return resp.status(404).json({ message: 'Could not find that todo' });

    } catch (error) {
        console.error(error);
        return resp.status(500).json({ message: 'Internal Server Error' });
    }
});


//get Completed Todos
router.get('/getcompletedtodo', middleware, async (req, resp) => {
    try {

        const author = await Todo.find({ author: req.user.id });


        const completedTodos = author.filter(todo => todo.isCompleted);

        if (completedTodos.length > 0) {
            return resp.status(200).json({ message: 'Your completed Todos', todos: completedTodos });
        } else {
            return resp.status(200).json({ message: 'No completed todos Found' });
        }
    } catch (error) {
        console.error(error);
        return resp.status(500).json({ message: 'Oops, some error occurred' });
    }
})


module.exports = router