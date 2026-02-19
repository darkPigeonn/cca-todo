export interface DbTask {
    _id: string
    id_project: string
    nama_task: string
    deskripsi: string
    deadline: Date
    priority: "low" | "mid" | "high"
    project_type: string
    members: any[]
    id_leader: string
    partner: string
    status: number
    createdAt: Date
    createdBy: string
    timeline: any[]
    note: string
  }
  

  export interface CardTask {
    id: string
    title: string
    project: string
    goal: string
    description: string
    priority: "Low" | "Medium" | "High"
    startDate: string
    dueDate: string
    proof: string
  }
  