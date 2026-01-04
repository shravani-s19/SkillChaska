// src/data/mockAdminData.ts

export interface Instructor {
  id: string;
  name: string;
  email: string;
  role: 'instructor' | 'pending';
  joinedDate: string;
}

// Initial state of instructors in our "database"
let instructors: Instructor[] = [
  { id: `inst_${Math.random().toString(36).substr(2, 9)}`, name: 'Jane Doe', email: 'jane.doe@codemaska.com', role: 'instructor', joinedDate: '2024-03-15' },
  { id: `inst_${Math.random().toString(36).substr(2, 9)}`, name: 'John Smith', email: 'john.smith@codemaska.com', role: 'instructor', joinedDate: '2024-02-01' },
];

// --- API FUNCTIONS ---

// GET all instructors
export const getInstructors = (): Promise<Instructor[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([...instructors]); // Return a copy
    }, 500);
  });
};

// ADD a new instructor (simulates backend registration)
export const addInstructor = (name: string, email: string): Promise<Instructor> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (instructors.some(inst => inst.email === email)) {
        reject(new Error('Email already exists.'));
        return;
      }
      
      const newInstructor: Instructor = {
        id: `inst_${Math.random().toString(36).substr(2, 9)}`,
        name,
        email,
        role: 'instructor',
        joinedDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      };
      
      instructors = [newInstructor, ...instructors];
      console.log("Instructor Added:", newInstructor);
      console.log("Current Instructors:", instructors);
      resolve(newInstructor);
    }, 1000);
  });
};

// DELETE an instructor
export const deleteInstructor = (id: string): Promise<{ success: true }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            instructors = instructors.filter(inst => inst.id !== id);
            console.log("Instructor Deleted:", id);
            console.log("Current Instructors:", instructors);
            resolve({ success: true });
        }, 500);
    });
};