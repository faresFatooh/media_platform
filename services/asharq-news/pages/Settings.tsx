
import React, { useState } from 'react';
import { Palette, Search, Users, Shield } from 'lucide-react';

type Tab = 'identity' | 'seo' | 'roles';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('identity');
    
    const renderTabContent = () => {
        switch(activeTab) {
            case 'identity':
                return <div>محتوى إعدادات الهوية البصرية والثيمات</div>;
            case 'seo':
                return <div>محتوى قواعد تحسين محركات البحث (SEO)</div>;
            case 'roles':
                return <div>محتوى إدارة صلاحيات وأدوار المستخدمين</div>;
            default:
                return null;
        }
    };

  return (
    <div className="bg-surface rounded-lg p-6">
      <h3 className="text-2xl font-bold mb-6">الإعدادات العامة</h3>
      <div className="flex border-b border-border">
          <button onClick={() => setActiveTab('identity')} className={`flex items-center px-6 py-3 text-lg font-semibold transition-colors ${activeTab === 'identity' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
              <Palette className="ml-2"/> الهوية البصرية
          </button>
          <button onClick={() => setActiveTab('seo')} className={`flex items-center px-6 py-3 text-lg font-semibold transition-colors ${activeTab === 'seo' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
              <Search className="ml-2"/> قواعد SEO
          </button>
          <button onClick={() => setActiveTab('roles')} className={`flex items-center px-6 py-3 text-lg font-semibold transition-colors ${activeTab === 'roles' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
              <Users className="ml-2"/> الأدوار والصلاحيات
          </button>
      </div>
      <div className="py-8">
        <div className="h-64 flex items-center justify-center text-center text-text-secondary bg-gray-900/50 rounded-lg">
          <div>
            <Shield className="w-16 h-16 mx-auto mb-4"/>
            <h4 className="text-2xl font-bold">
              {renderTabContent()}
            </h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
