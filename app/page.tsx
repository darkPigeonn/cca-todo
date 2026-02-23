'use client'

import React from 'react'
import { Layout, Table as TableIcon, Plus, LogOut, User as UserIcon, Loader2, Bell, AlertTriangle, TrendingUp, Users, User, AlertCircle, Shield } from 'lucide-react'
import Link from 'next/link'
import { useTaskBoard } from './hooks/useTaskBoard'
import BoardView from './components/BoardView'
import TableView from './components/TableView'
import TaskModal from './components/TaskModal'
import TaskDetailModal from './components/TaskDetailModal'
import ReasonModal from './components/ReasonModal'
import AchievementModal from './components/AchievementModal'
import QuickTaskForm from './components/QuickTaskForm'
import { useAuth } from './providers/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import MonitoringDashboard from './components/MonitoringDashboard'

export default function App() {
  const { user, loading, logout } = useAuth()
  const isCoordinator = user?.role?.toLowerCase() === 'coordinator' || user?.role?.toLowerCase() === 'koordinator'
  const [boardMode, setBoardMode] = useState<'my' | 'team'>('my')
  const [showEmergencyModal, setShowEmergencyModal] = useState(false)
  const [emergencyReason, setEmergencyReason] = useState('')

  const {
    lists,
    view,
    setView,
    newListName,
    setNewListName,
    isAddingList,
    setIsAddingList,
    modalMode,
    formData,
    setFormData,
    allTasks,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
    addList,
    deleteList,
    openAddModal,
    openEditModal,
    closeModal,
    handleFormSubmit,
    deleteCard,
    selectedCard,
    openDetailModal,
    closeDetailModal,
    openEditFromDetail,
    alarms,
    sendToWa,
    allTeamTasks,
    showReasonModal,
    showAchievementModal,
    pendingDrop,
    handleReasonConfirm,
    handleAchievementConfirm,
    handleModalCancel,
    submitQuickTask,
    sendTaskToday
  } = useTaskBoard(user?.id, isCoordinator && boardMode === 'team')

  const [showAlarms, setShowAlarms] = useState(false)

  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (user.isLinked === false) {
        router.push('/connect')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center gap-4">
          <Loader2 className="text-blue-600 animate-spin" size={40} />
          <p className="text-slate-500 font-bold animate-pulse">Menghubungkan Sesi...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar - Task Form */}
      <aside className="w-80 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 overflow-y-auto shadow-sm">
        <div className="p-5">
          <div className="mb-6 pb-5 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Layout size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-base font-black text-slate-900">Task Monitor</h1>
                <p className="text-[10px] text-slate-400">Centrum Carlo Acutis</p>
              </div>
            </div>
          </div>
          
          {/* Quick Task Form - Always Expanded */}
          <QuickTaskForm
            formData={formData}
            onChange={setFormData}
            onSubmit={async () => {
              // Submit langsung tanpa membuka modal
              const success = await submitQuickTask(formData)
              if (success) {
                // Reset form setelah berhasil
                setFormData({
                  title: '',
                  project: '',
                  goal: '',
                  description: '',
                  priority: 'Medium',
                  startDate: '',
                  dueDate: '',
                  proof: '',
                })
              }
            }}
            onCancel={() => {
              setFormData({
                title: '',
                project: '',
                goal: '',
                description: '',
                priority: 'Medium',
                startDate: '',
                dueDate: '',
                proof: '',
              })
            }}
            alwaysExpanded={true}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          {/* Dual-View Mode Toggle (for Coordinator) */}
          {isCoordinator ? (
            <div className="bg-slate-200 p-1 rounded-xl flex items-center shadow-inner">
              <button
                onClick={() => setBoardMode('my')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${boardMode === 'my' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <User size={16} />
                My Board
              </button>
              <button
                onClick={() => setBoardMode('team')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${boardMode === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                <Users size={16} />
                Team Board
              </button>
            </div>
          ) : null}

          <div className="bg-slate-200 p-1 rounded-xl flex items-center shadow-inner">
            <button
              onClick={() => setView('board')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'board' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Layout size={16} />
              Board
            </button>
            <button
              onClick={() => setView('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <TableIcon size={16} />
              Table
            </button>
            <button
              onClick={() => setView('dashboard' as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${view as string === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <TrendingUp size={16} />
              Metrics
            </button>
          </div>

          {/* Alarm Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowAlarms(!showAlarms)}
              className={`p-2.5 rounded-xl border transition-all relative ${alarms.length > 0 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-white border-slate-200 text-slate-400'}`}
            >
              <Bell size={20} />
              {alarms.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {alarms.length}
                </span>
              )}
            </button>

            {showAlarms && alarms.length > 0 && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-red-100 z-50 p-4 max-h-96 overflow-y-auto">
                <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600" />
                  Monitoring Alarms
                </h3>
                <div className="space-y-2">
                  {alarms.map((alarm, idx) => (
                    <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-700 leading-relaxed">
                      {alarm}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin Link (for Coordinator) */}
          {isCoordinator && (
            <Link
              href="/admin/claims"
              className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-200 flex items-center gap-2"
            >
              <Shield size={18} />
              Admin
            </Link>
          )}

          {/* Emergency Button */}
          <button
            onClick={() => setShowEmergencyModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-red-200 flex items-center gap-2 animate-pulse"
            title="Log Komplain Mendadak"
          >
            <AlertCircle size={18} />
            Emergency
          </button>

          {/* Copy today task Button */}
          <button
            onClick={()=> sendTaskToday(user?.name)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-200 flex items-center gap-2"
          >  
            Salin Tugas Hari ini
          </button>

          <button
            onClick={() => sendToWa(user?.name || 'User', isCoordinator)}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-200 flex items-center gap-2"
          >           
            Salin Laporan Atasan
          </button>

          {/* User Profile - Pojok Kanan Atas */}
          <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-2xl border border-slate-200 shadow-sm group ml-auto">
            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden border border-blue-200">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <UserIcon size={20} />
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-none">{user.name || user.email}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {user.role || 'Employee'}
              </p>
            </div>
            <button
              onClick={logout}
              className="ml-2 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {view as string === 'dashboard' ? (
        <MonitoringDashboard tasks={allTasks} />
      ) : view === 'board' ? (
        <BoardView
          lists={lists}
          isAddingList={isAddingList}
          newListName={newListName}
          onNewListNameChange={setNewListName}
          onAddList={addList}
          onDeleteList={deleteList}
          onOpenAddModal={openAddModal}
          onOpenEditModal={openEditModal}
          onDeleteCard={deleteCard}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          setIsAddingList={setIsAddingList}
          onOpenDetailModal={openDetailModal}
          showUserNames={isCoordinator && boardMode === 'team'}
        />
      ) : (
        <TableView
          allTasks={allTasks}
          onEdit={openEditModal}
          onDelete={deleteCard}
          onOpenDetailModal={openDetailModal}
        />
      )}

      {/* Detail Modal */}
      {selectedCard && (
        <TaskDetailModal
          card={selectedCard.card}
          listTitle={selectedCard.listTitle}
          onClose={closeDetailModal}
          onEdit={openEditFromDetail}
          
        />
      )}

      {/* Modals */}
      {modalMode && (
        <TaskModal
          mode={modalMode}
          formData={formData}
          onChange={setFormData}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
        />
      )}

      {/* Reason Modal (for Backlog) */}
      {showReasonModal && pendingDrop && (
        <ReasonModal
          title="Alasan Penundaan"
          label="Alasan Penundaan"
          placeholder="Mengapa tugas ini dipindahkan ke Backlog? Jelaskan alasan penundaan..."
          onConfirm={handleReasonConfirm}
          onCancel={handleModalCancel}
          required={true}
        />
      )}

      {/* Achievement Modal (for Done) */}
      {showAchievementModal && pendingDrop && (
        <AchievementModal
          taskTitle={pendingDrop.card.title}
          onConfirm={handleAchievementConfirm}
          onCancel={handleModalCancel}
        />
      )}

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <ReasonModal
          title="Log Komplain Mendadak"
          label="Deskripsi Interupsi"
          placeholder="Jelaskan komplain atau gangguan darurat yang terjadi..."
          onConfirm={async (reason) => {
            // Log emergency interruption
            try {
              await fetch('/api/tasks/emergency', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user?.id,
                  userName: user?.name,
                  reason,
                  timestamp: new Date().toISOString(),
                }),
              })
              alert('Interupsi berhasil dicatat ✅')
              setShowEmergencyModal(false)
              setEmergencyReason('')
            } catch (error) {
              alert('Gagal mencatat interupsi')
              console.error(error)
            }
          }}
          onCancel={() => {
            setShowEmergencyModal(false)
            setEmergencyReason('')
          }}
          required={true}
        />
      )}

          <style dangerouslySetInnerHTML={{
            __html: `
            .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
          `}} />
        </div>
      </main>
    </div>
  )
}