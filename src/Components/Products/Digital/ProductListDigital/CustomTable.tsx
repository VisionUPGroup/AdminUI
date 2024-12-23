import { FC, useMemo } from 'react';
import dynamic from 'next/dynamic';

const DataTable = dynamic(() => import('react-data-table-component'), {
    ssr: false,
    loading: () => (
        <div style={{ padding: '24px', textAlign: 'center' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    ),
});

interface TableProps {
    data: any[];
    columns: any[];
    pagination?: boolean;
    paginationServer?: boolean;
    paginationTotalRows?: number;
    progressPending?: boolean;
    onChangePage?: (page: number) => void;
    onChangeRowsPerPage?: (currentRowsPerPage: number, currentPage: number) => void;
    onSort?: (column: any, direction: string) => void;
    className?: string;
    currentPage?: number;
    pageSize?: number;
}

const CustomTable: FC<TableProps> = ({
    data = [],
    columns,
    pagination = true,
    paginationServer = false,
    paginationTotalRows,
    progressPending = false,
    onChangePage,
    onChangeRowsPerPage,
    onSort,
    className,
    currentPage = 1,
    pageSize = 10,
}) => {
    const customStyles = useMemo(() => ({
        table: {
            style: {
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'hidden',
            },
        },
        tableWrapper: {
            style: {
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            },
        },
        headRow: {
            style: {
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                minHeight: '50px',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        headCells: {
            style: {
                fontSize: '14px',
                fontWeight: 600,
                color: '#475569',
                paddingLeft: '16px',
                paddingRight: '16px',
            },
        },
        cells: {
            style: {
                paddingLeft: '16px',
                paddingRight: '16px',
                fontSize: '14px',
            },
        },
        rows: {
            style: {
                minHeight: '60px',
                '&:not(:last-of-type)': {
                    borderBottom: '1px solid #e2e8f0',
                },
                '&:hover': {
                    backgroundColor: '#f8fafc',
                },
            },
        },
        pagination: {
            style: {
                borderTop: '1px solid #e2e8f0',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            },
            pageButtonsStyle: {
                borderRadius: '6px',
                height: '32px',
                padding: '0 12px',
                margin: '0 4px',
                cursor: 'pointer',
                transition: 'all .2s ease',
                backgroundColor: 'transparent',
                border: '1px solid #e2e8f0',
                color: '#475569',
                '&:hover:not(:disabled)': {
                    backgroundColor: '#f1f5f9',
                    borderColor: '#cbd5e1',
                },
                '&:focus': {
                    outline: 'none',
                },
                '&:disabled': {
                    opacity: 0.6,
                    cursor: 'not-allowed',
                },
            },
        },
    }), []);

    const memoizedOptions = useMemo(() => ({
        sortIcon: <span className="ms-1">↕</span>,
        sortServer: paginationServer,
        progressComponent: (
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        ),
        noDataComponent: (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
                No records found
            </div>
        ),
        paginationComponentOptions: {
            rowsPerPageText: 'Items per page:',
            rangeSeparatorText: 'of',
            selectAllRowsItem: true,
            selectAllRowsItemText: 'All',
        },
    }), [paginationServer]);

    return (
        <div className={className}>
            <DataTable
                columns={columns}
                data={data}
                pagination={pagination}
                paginationServer={paginationServer}
                paginationTotalRows={paginationTotalRows}
                onChangePage={onChangePage}
                onChangeRowsPerPage={onChangeRowsPerPage}
                onSort={onSort}
                progressPending={progressPending}
                customStyles={customStyles}
                {...memoizedOptions}
                paginationDefaultPage={currentPage}
                paginationPerPage={pageSize}
                persistTableHead
                fixedHeader
            />
            {pagination && paginationTotalRows && (
                <div style={{ 
                    padding: '8px 16px',
                    borderTop: '1px solid #e2e8f0',
                    fontSize: '14px',
                    color: '#64748b',
                    textAlign: 'right' 
                }}>
                    Total: {paginationTotalRows} items
                </div>
            )}
        </div>
    );
};

export default CustomTable;