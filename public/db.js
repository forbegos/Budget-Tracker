let db;

const request = indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;

  // if (db.objectStoreNames.lenght === 0) {}
  db.createObjectStore("BudgetStore", { autoIncrement: true });
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

const saveRecord = (record) => {
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const tsx = transaction.objectStore("BudgetStore");
  tsx.add(record);
};

function checkDatabase() {
  var transaction = db.transaction(["BudgetStore"], "readwrite");
  const txs = transaction.objectStore("BudgetStore");
  const getAll = txs.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((res) => {
          if (res.length !== 0) {
            transaction = db.transaction(["BudgetStore"], "readwrite");
            const tsx = transaction.objectStore("BudgetStore");
            tsx.clear();
          }
        });
    }
  };
}

window.addEventListener("online", checkDatabase);
