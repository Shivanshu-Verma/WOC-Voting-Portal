// indexedDBHelpers.js

// Initialize IndexedDB
export const initializeDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('VotingDB', 1);
    
    request.onerror = (event) => {
      console.error('Error opening IndexedDB:', event.target.error);
      reject(event.target.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store for commitment sums
      if (!db.objectStoreNames.contains('commitmentSums')) {
        const store = db.createObjectStore('commitmentSums', { keyPath: 'position' });
        console.log('IndexedDB store created for commitment sums');
      }
    };
    
    request.onsuccess = (event) => {
      console.log('IndexedDB opened successfully');
      resolve(event.target.result);
    };
  });
};

// Get commitment sum from IndexedDB
export const getCommitmentSum = async (position) => {
  const db = await initializeDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['commitmentSums'], 'readonly');
    const store = transaction.objectStore('commitmentSums');
    const request = store.get(position);
    
    request.onerror = (event) => {
      console.error('Error getting commitment sum:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      const result = event.target.result;
      resolve(result ? result.randomVector : null);
    };
  });
};

// Update commitment sum in IndexedDB
export const updateCommitmentSum = async (position, newCommitment) => {
  const db = await initializeDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['commitmentSums'], 'readwrite');
    const store = transaction.objectStore('commitmentSums');
    
    const getRequest = store.get(position);

    getRequest.onerror = (event) => {
      console.error('Error getting existing commitment sum:', event.target.error);
      reject(event.target.error);
    };

    getRequest.onsuccess = (event) => {
      const existingData = event.target.result;
      let updatedVector;

      if (existingData && existingData.randomVector) {
        // Ensure we correctly sum with possible length mismatches
        updatedVector = existingData.randomVector.map((sum, index) => 
          index < newCommitment.length ? sum + newCommitment[index] : sum
        );

        // If newCommitment has more elements, extend the array
        if (newCommitment.length > existingData.randomVector.length) {
          updatedVector = [...updatedVector, ...newCommitment.slice(existingData.randomVector.length)];
        }
      } else {
        updatedVector = [...newCommitment]; // First time insert
      }

      // Store the updated sum back into IndexedDB
      const putRequest = store.put({ position, randomVector: updatedVector });

      putRequest.onerror = (event) => {
        console.error('Error updating commitment sum:', event.target.error);
        reject(event.target.error);
      };

      putRequest.onsuccess = () => {
        console.log(`Commitment sum updated for position: ${position}`, updatedVector);
        resolve(updatedVector);
      };
    };
  });
};


// Get all commitment sums from IndexedDB
export const getAllCommitmentSums = async () => {
  const db = await initializeDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['commitmentSums'], 'readonly');
    const store = transaction.objectStore('commitmentSums');
    const request = store.getAll();
    
    request.onerror = (event) => {
      console.error('Error getting all commitment sums:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

// Clear all commitment sums from IndexedDB
export const clearAllCommitmentSums = async () => {
  const db = await initializeDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['commitmentSums'], 'readwrite');
    const store = transaction.objectStore('commitmentSums');
    const request = store.clear();
    
    request.onerror = (event) => {
      console.error('Error clearing commitment sums:', event.target.error);
      reject(event.target.error);
    };
    
    request.onsuccess = (event) => {
      console.log('All commitment sums cleared');
      resolve();
    };
  });
};
