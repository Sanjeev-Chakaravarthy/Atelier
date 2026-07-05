import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, CheckCircle2, AlertTriangle, Layers, Calendar, 
  ArrowUpRight, BarChart2, Activity, Info 
} from 'lucide-react';
import PageLayout from '../components/layout/PageLayout';
import Card from '../components/ui/Card';
import DonutChart from '../components/charts/DonutChart';
import AreaChart from '../components/charts/AreaChart';
import HeatmapChart from '../components/charts/HeatmapChart';
import { analyticsAPI } from '../services/api';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    efficiency: 0,
  });

  const [statusSpread, setStatusSpread] = useState([]);
  const [prioritySpread, setPrioritySpread] = useState([]);
  const [velocityData, setVelocityData] = useState([]);
  const [heatmapData, setHeatmapData] = useState({});

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [overviewRes, velocityRes, heatmapRes, distributionRes] = await Promise.allSettled([
          analyticsAPI.getOverview(),
          analyticsAPI.getVelocity(30),
          analyticsAPI.getHeatmap(),
          analyticsAPI.getDistribution()
        ]);

        // 1. Overview Metrics
        if (overviewRes.status === 'fulfilled' && overviewRes.value.data?.overview) {
          const { total = 0, done = 0, inProgress = 0, completionRate = 0 } = overviewRes.value.data.overview;
          setMetrics({
            total,
            completed: done,
            inProgress,
            efficiency: completionRate,
          });
        }

        // 2. Velocity Data
        if (velocityRes.status === 'fulfilled' && velocityRes.value.data?.velocity) {
          setVelocityData(velocityRes.value.data.velocity);
        } else {
          setVelocityData([]);
        }

        // 3. Heatmap Matrix
        if (heatmapRes.status === 'fulfilled' && heatmapRes.value.data?.heatmap) {
          setHeatmapData(heatmapRes.value.data.heatmap);
        } else {
          setHeatmapData({});
        }

        // 4. Distributions spread
        if (distributionRes.status === 'fulfilled' && distributionRes.value.data) {
          const { byStatus = [], byPriority = [] } = distributionRes.value.data;
          
          const statusMap = {
            todo: 'To Do',
            'in-progress': 'In Progress',
            review: 'In Review',
            done: 'Completed'
          };
          const mappedStatus = byStatus.map(item => ({
            name: statusMap[item._id] || item._id,
            value: item.count
          }));

          const priorityMap = {
            low: 'Low Priority',
            medium: 'Medium Priority',
            high: 'High Priority',
            urgent: 'Urgent Alert'
          };
          const mappedPriority = byPriority.map(item => ({
            name: priorityMap[item._id] || item._id,
            value: item.count
          }));

          setStatusSpread(mappedStatus.length > 0 ? mappedStatus : []);
          setPrioritySpread(mappedPriority.length > 0 ? mappedPriority : []);
        }

      } catch (err) {
        console.warn("Analytics pipeline fetch error", err);
        setStatusSpread([]);
        setPrioritySpread([]);
        setVelocityData([]);
        setHeatmapData({});
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <PageLayout title="Analytics">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        
        {/* Headline Header */}
        <div>
          <h1 className="text-headline-md font-bold text-on-surface">Analytics</h1>
          <p className="text-body-sm text-on-surface-var/60 mt-1">
            Real-time analytics engine monitoring task burn rate, velocity cycles, and operational trends.
          </p>
        </div>

        {/* METRICS CARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 flex items-center justify-between">
            <div>
              <span className="text-label-sm text-on-surface-var/50 uppercase tracking-wider block">Total Projects Scope</span>
              <span className="text-[2.25rem] font-bold text-on-surface leading-none mt-2 block">{metrics.total}</span>
              <span className="text-[10px] text-cyan flex items-center gap-0.5 mt-1 font-semibold">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12% this sprint
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center text-cyan shadow-glow-cyan">
              <Layers className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-6 flex items-center justify-between">
            <div>
              <span className="text-label-sm text-on-surface-var/50 uppercase tracking-wider block">Missions Completed</span>
              <span className="text-[2.25rem] font-bold text-emerald leading-none mt-2 block">{metrics.completed}</span>
              <span className="text-[10px] text-emerald flex items-center gap-0.5 mt-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% verified status
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center text-emerald shadow-glow-emerald">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-6 flex items-center justify-between">
            <div>
              <span className="text-label-sm text-on-surface-var/50 uppercase tracking-wider block">Active Execution</span>
              <span className="text-[2.25rem] font-bold text-primary leading-none mt-2 block">{metrics.inProgress}</span>
              <span className="text-[10px] text-on-surface-var/40 flex items-center gap-0.5 mt-1 font-semibold">
                In-progress status pipeline
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-glow">
              <Activity className="w-6 h-6" />
            </div>
          </Card>

          <Card className="p-6 flex items-center justify-between">
            <div>
              <span className="text-label-sm text-on-surface-var/50 uppercase tracking-wider block">Velocity Efficiency</span>
              <span className="text-[2.25rem] font-bold text-tertiary leading-none mt-2 block">{metrics.efficiency}%</span>
              <span className="text-[10px] text-tertiary flex items-center gap-0.5 mt-1 font-semibold">
                Optimal delivery speed
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
              <TrendingUp className="w-6 h-6" />
            </div>
          </Card>
        </div>

        {/* GRAPH SECION: VELOCITY AREA CHART */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-body-lg font-bold text-on-surface">Task Velocity Stream</h3>
              <p className="text-label-sm text-on-surface-var/50 mt-0.5">
                Comparison of daily created missions versus completed sprint cycles.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-[#8083ff]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8083ff] shadow-glow" />
                <span>Created</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald shadow-glow-emerald" />
                <span>Completed</span>
              </div>
            </div>
          </div>

          <div className="w-full mt-4">
            <AreaChart data={velocityData} height={320} />
          </div>
        </Card>

        {/* DONUT CHARTS: PRIORITY / STATUS SPREAD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-body-lg font-bold text-on-surface">Mission Status Layout</h3>
              <p className="text-label-sm text-on-surface-var/50 mt-0.5">Distribution count based on development stages.</p>
            </div>
            <div className="flex items-center justify-center py-4">
              <DonutChart data={statusSpread} height={260} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-body-lg font-bold text-on-surface">Priority Density Matrix</h3>
              <p className="text-label-sm text-on-surface-var/50 mt-0.5">Task criticality index spread across backlog.</p>
            </div>
            <div className="flex items-center justify-center py-4">
              <DonutChart data={prioritySpread} height={260} />
            </div>
          </Card>

        </div>

        {/* HEATMAP CALENDAR MATRIX */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-body-lg font-bold text-on-surface">Commitment Intensity</h3>
              <p className="text-label-sm text-on-surface-var/50 mt-0.5">
                Heatmap detailing completed actions and operational output over the past 365 days.
              </p>
            </div>
            <div className="text-label-sm text-on-surface-var/40 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-primary" /> Daily completed items
            </div>
          </div>

          <div className="w-full overflow-x-auto py-2">
            <HeatmapChart data={heatmapData} />
          </div>
        </Card>

      </div>
    </PageLayout>
  );
}
