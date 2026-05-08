import React from 'react';
import DocumentSelector from './DocumentSelector';
import HenryOperationsPanel from './HenryOperationsPanel';
import IdentityScanner from './IdentityScanner';
import Disclosure from './Disclosure';
import { useSidebarContent } from '../hooks/useSidebarContent';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const InfoArticlesPanel = () => {
  const { activeTemplateLabel, highlights, articles, lastUpdated } = useSidebarContent();

  return (
    <Paper
      component="aside"
      variant="outlined"
      className="info-articles-panel print-hidden"
      aria-label="Henry's guidance sidebar"
      sx={{ borderRadius: 2, overflow: 'hidden' }}
    >
      {/* Sidebar header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #fefce8 0%, #fff7ed 100%)',
          borderLeft: '3px solid #d97706',
        }}
      >
        <Box component="span" aria-hidden="true" sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
          🤵
        </Box>
        <Box>
          <Typography
            variant="subtitle2"
            component="h3"
            fontWeight={700}
            sx={{ color: '#92400e', lineHeight: 1.3 }}
          >
            Henry's Guidance
          </Typography>
          <Typography variant="caption" sx={{ color: '#b45309' }}>
            The Record Keeper · WC-AI-003
          </Typography>
        </Box>
      </Box>

      {/* Meta info */}
      <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider', background: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
        <Typography variant="caption" component="p" color="text.secondary" sx={{ mb: 0.25 }}>
          Active document: <strong>{activeTemplateLabel}</strong>
        </Typography>
        <Typography variant="caption" component="p" color="text.secondary">
          Guidance updated: {lastUpdated}
        </Typography>
      </Box>

      {/* Disclosure sections */}
      <Box sx={{ px: 1.5, py: 1 }}>
        <Disclosure title="Templates" icon="📄" defaultOpen>
          <DocumentSelector />
        </Disclosure>

        <Disclosure title="Operations" icon="⚙️">
          <HenryOperationsPanel />
        </Disclosure>

        <Disclosure title="Identity Scanner" icon="🪪">
          <IdentityScanner />
        </Disclosure>

        <Disclosure title="Filing Highlights" icon="💡" badge={highlights.length || null}>
          <Box role="list" aria-label="Key filing highlights" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {highlights.map((item, idx) => (
              <Typography
                key={`${item}-${idx}`}
                variant="body2"
                component="p"
                role="listitem"
                sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.5 }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </Disclosure>

        <Disclosure title="Guidance Articles" icon="📚" badge={articles.length || null}>
          <Box role="list" aria-label="Henry's document guidance articles" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {articles.map((article) => (
              <Box
                key={article.title}
                component="article"
                role="listitem"
                sx={{
                  p: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#fafafa',
                }}
              >
                <Typography variant="subtitle2" component="h4" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                  {article.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.77rem', lineHeight: 1.5 }}>
                  {article.text}
                </Typography>
              </Box>
            ))}
          </Box>
        </Disclosure>
      </Box>
    </Paper>
  );
};

export default React.memo(InfoArticlesPanel);

