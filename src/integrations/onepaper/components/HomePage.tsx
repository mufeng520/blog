import React, { useState } from 'react';
import IconLoader from './IconLoader';
import { ToastContainer } from './Toast';
import ApiKeyConfig from './ApiKeyConfig';
import { getStudio } from '../studios';
import { useHomePageState } from '../hooks/useHomePageState';
import { toolRoutes } from '../../../lib/tool-routes';

const HomePage: React.FC = () => {
    const {
        lang,
        setLang,
        theme,
        toggleTheme,
        projects,
        isLoading,
        notifications,
        dismissNotification,
        handleCreateProject,
        handleDeleteProject,
        handleRenameProject,
    } = useHomePageState();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showApiKeyConfig, setShowApiKeyConfig] = useState(false);
    const [renamingProjectId, setRenamingProjectId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    return (
        <div className={`min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col font-sans ${theme}`}>
            <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-6 md:p-12">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="w-12 h-12 rounded-full overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <img src="/integrations/onepaper/logo.png" alt="OnePaper" className="w-full h-full object-cover" />
                            </button>
                            {isMenuOpen && (
                                <div className="absolute top-14 left-0 w-48 bg-white dark:bg-stone-800 rounded-xl shadow-xl border border-stone-200 dark:border-stone-700 z-50 overflow-hidden">
                                    <button onClick={toggleTheme} className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center gap-2">
                                        {theme === 'dark' ? <IconLoader name="sun" size={16} /> : <IconLoader name="moon" size={16} />}
                                        {theme === 'dark' ? (lang === 'zh' ? '浅色模式' : 'Light Mode') : (lang === 'zh' ? '深色模式' : 'Dark Mode')}
                                    </button>
                                    <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center gap-2">
                                        <IconLoader name="globe" size={16} />
                                        {lang === 'zh' ? 'English' : '中文'}
                                    </button>
                                    <div className="h-px bg-stone-200 dark:bg-stone-700 my-1"></div>
                                    <button onClick={() => { setShowApiKeyConfig(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center gap-2">
                                        <IconLoader name="settings" size={16} />
                                        {lang === 'zh' ? 'API Key 设置' : 'API Key Settings'}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">OnePaper</h1>
                            <p className="text-xs text-stone-400 dark:text-stone-500">{lang === 'zh' ? '我的项目' : 'My Projects'}</p>
                            <p className="text-stone-500 dark:text-stone-400 text-sm">
                                {projects.length} {lang === 'zh' ? '个项目' : 'Projects'} · {lang === 'zh' ? '最近更新' : 'Recently updated'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleCreateProject} className="px-6 py-3 bg-stone-800 dark:bg-white text-white dark:text-black rounded-xl font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
                        <IconLoader name="plus" size={20} />
                        {lang === 'zh' ? '新建项目' : 'New Project'}
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin text-stone-300"><IconLoader name="loader" size={48} /></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        <div onClick={handleCreateProject} className="aspect-[4/3] rounded-2xl border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-teal-400 dark:hover:border-teal-500 bg-stone-100 dark:bg-stone-900/50 flex flex-col items-center justify-center gap-3 cursor-pointer group transition-all">
                            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-500 group-hover:scale-110 transition-transform flex items-center justify-center">
                                <IconLoader name="plus" size={24} />
                            </div>
                            <span className="font-bold text-stone-500 dark:text-stone-400 group-hover:text-teal-500 transition-colors">
                                {lang === 'zh' ? '创建空白项目' : 'Create Blank Project'}
                            </span>
                        </div>
                        {projects.map(project => {
                            const studio = getStudio(project.studioType);
                            return (
                            <div key={project.id} onClick={() => window.open(toolRoutes.onePaper.editor(project.id), '_blank')} className="group relative aspect-[4/3] bg-white dark:bg-stone-800 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-stone-200 dark:border-stone-800 overflow-hidden cursor-pointer hover:-translate-y-1">
                                <div className="h-2/3 bg-stone-200 dark:bg-stone-700 relative overflow-hidden">
                                    {project.thumbnailUrl ? (
                                        <img src={project.thumbnailUrl} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300 dark:text-stone-600"><IconLoader name="image" size={32} /></div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-white/80 dark:bg-black/60 text-${studio.themeColor}-600 dark:text-${studio.themeColor}-400 backdrop-blur-sm`}>
                                        {lang === 'zh' ? studio.name_zh : studio.name}
                                    </div>
                                </div>
                                <div className="h-1/3 p-4 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        {renamingProjectId === project.id ? (
                                            <input
                                                value={renameValue}
                                                onChange={(e) => setRenameValue(e.target.value)}
                                                onBlur={() => { handleRenameProject(project.id, renameValue); setRenamingProjectId(null); }}
                                                onKeyDown={(e) => { if (e.key === 'Enter') { handleRenameProject(project.id, renameValue); setRenamingProjectId(null); } if (e.key === 'Escape') setRenamingProjectId(null); }}
                                                autoFocus
                                                className="font-bold text-stone-800 dark:text-stone-100 bg-transparent border-b border-stone-400 outline-none flex-1 pr-2 text-sm"
                                            />
                                        ) : (
                                            <h3 className="font-bold text-stone-800 dark:text-stone-100 truncate flex-1 pr-2" title={project.name}>{project.name}</h3>
                                        )}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            <button onClick={(e) => { e.stopPropagation(); setRenamingProjectId(project.id); setRenameValue(project.name); }} className="text-stone-400 hover:text-teal-500 p-1" title={lang === 'zh' ? '重命名' : 'Rename'}>
                                                <IconLoader name="edit" size={16} />
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }} className="text-stone-400 hover:text-red-500 p-1" title={lang === 'zh' ? '删除' : 'Delete'}>
                                                <IconLoader name="trash" size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-stone-400">{new Date(project.updatedAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showApiKeyConfig && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-stone-900 rounded-2xl shadow-2xl relative">
                        <button onClick={() => setShowApiKeyConfig(false)} className="absolute top-4 right-4 text-stone-400 hover:text-white">
                            <IconLoader name="x" size={20} />
                        </button>
                        <ApiKeyConfig onConfigured={() => setShowApiKeyConfig(false)} />
                    </div>
                </div>
            )}

            <ToastContainer notifications={notifications} onClose={dismissNotification} />
        </div>
    );
};

export default HomePage;
