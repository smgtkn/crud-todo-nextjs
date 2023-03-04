//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";

//core
import "primereact/resources/primereact.min.css";

//icons
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import { Checkbox } from "primereact/checkbox";
import React, { useState, useEffect, useRef } from "react";
import { classNames } from "primereact/utils";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Rating } from "primereact/rating";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { RadioButton } from "primereact/radiobutton";
import { InputNumber } from "primereact/inputnumber";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import axios from "axios";
import { Nullable } from "primereact/ts-helpers";
export default function Home() {
  interface Task {
    id: number;
    title: string;
    details: string;
    isCompleted: boolean;
    createdAt: Nullable<Date | string | Date[]>;
    due: Nullable<Date | string | Date[]>;
  }
  let emptyTask: Task = {
    id: -1,
    title: "",
    details: "",
    isCompleted: false,
    createdAt: new Date(),
    due: new Date(),
  };

  const accessKey = "9d284b02b2a15884ba8a1bba4e7ce875d11ae3bb";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskDialog, setTaskDialog] = useState<boolean>(false);
  const [editDialog, setEditDialog] = useState<boolean>(false);
  const [task, setTask] = useState<Task>(emptyTask);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const dt = useRef(null);
  const toast = useRef(null);
  const [deleteTaskDialog, setDeleteTaskDialog] = useState(false);

  async function fetchTasks() {
    const response = await axios
      .get("https://todo.crudful.com/tasks", {
        headers: { cfAccessKey: `${accessKey}` },
      })
      .then((response) => {
        setTasks(response.data.results);
      })
      .catch((error) => {
        alert(error);
      });
  }

  useEffect(() => {
    fetchTasks();
  }, []);
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  const createTask = async () => {
    setSubmitted(true);
    if (task.title != "") {
      const response = await axios
        .post(
          "https://todo.crudful.com/tasks",
          {
            title: task.title,
            details: task.details,
            due: task.due,
            isCompleted: task.isCompleted,
          },
          { headers: { cfAccessKey: `${accessKey}` } }
        )
        .then(() => fetchTasks())
        .catch((error) => alert(error));
      setTaskDialog(false);
      setTask(emptyTask);
    }
  };
  const deleteTask = async () => {
    const taskId = task.id;
    const response = await axios
      .delete(`https://todo.crudful.com/tasks/${taskId}`, {
        headers: { cfAccessKey: `${accessKey}` },
      })
      .then(() => fetchTasks())
      .catch((err) => alert(err));
    setDeleteTaskDialog(false);
    setTask(emptyTask);
  };
  const getTask = async (taskId: number) => {
    const response = await axios
      .get(`https://todo.crudful.com/tasks/${taskId}`, {
        headers: { cfAccessKey: `${accessKey}` },
      })
      .then((res) => {
        console.log("111", res.data);
        setTask(res.data);
        setSubmitted(false);
        setEditDialog(true);
      })
      .catch((err) => alert(err));
  };
  const editTask = async () => {
    setSubmitted(true);
    if (task.title != "") {
      const taskId = task.id;
      const response = await axios
        .put(
          `https://todo.crudful.com/tasks/${taskId}`,
          {
            title: task.title,
            details: task.details,
            due: task.due,
            isCompleted: task.isCompleted,
          },
          { headers: { cfAccessKey: `${accessKey}` } }
        )
        .then(() => fetchTasks())
        .catch((err) => alert(err));
      setEditDialog(false);
      setTask(emptyTask);
    }
  };

  const hideDialog = () => {
    setTaskDialog(false);
    setEditDialog(false);
    setSubmitted(false);
  };
  const openNew = () => {
    setTask(emptyTask);

    setTaskDialog(true);
    setSubmitted(false);
  };
  const hideDeleteTaskDialog = () => {
    setDeleteTaskDialog(false);
  };
  const confirmDeleteTask = (task: Task) => {
    setTask(task);
    setDeleteTaskDialog(true);
  };
  const editTaskOpen = async (task: Task) => {
    getTask(task.id);
  };

  const taskDialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDialog}
      />
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={taskDialog ? createTask : editTask}
      />
    </React.Fragment>
  );
  const header = (
    <div className="flex flex-column md:flex-row md:align-items-center">
      <div className="mt-3 md:mt-0 flex justify-content-end">
        <Button
          icon="pi pi-plus"
          className="mr-2 p-button-rounded"
          tooltip="Add New Task"
          onClick={openNew}
          tooltipOptions={{ position: "bottom" }}
        />
      </div>
    </div>
  );
  const actionBodyTemplate = (rowData: Task) => {
    return (
      <React.Fragment>
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success mr-2"
          onClick={() => editTaskOpen(rowData)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger "
          onClick={() => confirmDeleteTask(rowData)}
        />
      </React.Fragment>
    );
  };
  const deleteTaskDialogFooter = (
    <React.Fragment>
      <Button
        label="No"
        icon="pi pi-times"
        className="p-button-text"
        onClick={hideDeleteTaskDialog}
      />
      <Button
        label="Yes"
        icon="pi pi-check"
        className="p-button-text"
        onClick={deleteTask}
      />
    </React.Fragment>
  );

  return (
    <div className="datatable-crud-demo surface-card p-4 border-round shadow-2">
      <Toast ref={toast} />

      <div className="text-3xl text-800 font-bold mb-4">Tasks</div>

      <DataTable
        ref={dt}
        value={tasks}
        selection={[]}
        // onSelectionChange={(e) => setSelectedProducts(e.value)}
        dataKey="id"
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
        // globalFilter={globalFilter}
        header={header}
        responsiveLayout="scroll"
      >
        <Column
          field="title"
          header="Title"
          sortable
          style={{ minWidth: "12rem" }}
        ></Column>
        <Column
          field="createdAt"
          header="Created Date"
          sortable
          body={(rowData) => formatDate(rowData.createdAt)}
          style={{ minWidth: "12rem" }}
        ></Column>
        <Column
          field="due"
          header="Due Date"
          body={(rowData) => formatDate(rowData.due)}
          sortable
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="isCompleted"
          header="Status"
          style={{ minWidth: "12rem" }}
          body={(rowData) => (rowData.isCompleted ? "Completed" : "In Process")}
        ></Column>
        <Column
          body={actionBodyTemplate}
          exportable={false}
          style={{ minWidth: "8rem" }}
        ></Column>
      </DataTable>
      <Dialog
        visible={taskDialog || editDialog}
        breakpoints={{ "960px": "75vw", "640px": "100vw" }}
        style={{ width: "40vw" }}
        header={taskDialog ? "Add New Task" : "Edit Task"}
        modal
        className="p-fluid"
        footer={taskDialogFooter}
        onHide={hideDialog}
      >
        <div className="field">
          <label htmlFor="title">Name</label>
          <InputText
            id="title"
            value={task.title}
            required
            autoFocus
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            className={classNames({ "p-invalid": submitted && !task.title })}
          />
          {submitted && !task.title && (
            <small className="p-error">Title is required.</small>
          )}
        </div>
        <div className="field">
          <label htmlFor="details">details</label>
          <InputTextarea
            id="details"
            value={task.details}
            onChange={(e) => setTask({ ...task, details: e.target.value })}
            required
            rows={3}
            cols={20}
          />
        </div>
        <div className="field">
          <label htmlFor="due">Due Date</label>
          <Calendar
            value={task.due}
            onChange={(e) => setTask({ ...task, due: e.value })}
            dateFormat="dd/mm/yy"
          />
        </div>
        <div className="flex align-items-center">
          <label htmlFor="isCompleted">Completed</label>
          <Checkbox
            onChange={(e) =>
              setTask({ ...task, isCompleted: e.checked as boolean })
            }
            checked={task.isCompleted}
          ></Checkbox>
        </div>
      </Dialog>
      <Dialog
        visible={deleteTaskDialog}
        style={{ width: "450px" }}
        header="Confirm"
        modal
        footer={deleteTaskDialogFooter}
        onHide={hideDeleteTaskDialog}
      >
        <div className="flex align-items-center justify-content-center">
          <i
            className="pi pi-exclamation-triangle mr-3"
            style={{ fontSize: "2rem" }}
          />
          {task && (
            <span>
              Are you sure you want to delete <b>{task.title}</b>?
            </span>
          )}
        </div>
      </Dialog>
    </div>
  );
}
