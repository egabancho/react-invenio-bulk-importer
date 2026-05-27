import { css } from '@/styled-system/css';

export const styles = {
  idContainer: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }),
  codeElement: css({
    fontSize: '0.9em',
    color: '#666'
  }),
  titleContainer: css({
    maxInlineSize: '18.75rem'
  }),
  noTitle: css({
    color: '#999'
  }),
  errorIcon: css({
    marginInlineStart: '0.5rem !important',
    cursor: 'help'
  }),
  exportErrorIcon: css({
    cursor: 'help'
  }),
  actionsCell: css({
    whiteSpace: 'nowrap'
  }),
  actionsContainer: css({
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '0.5rem',
    flexWrap: 'wrap'
  })
};
