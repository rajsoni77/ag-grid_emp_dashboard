import React, { useMemo, useState, useRef, useCallback } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community'
import { Employee } from '../types/Employee'
import { employeeData } from '../data/employeeData'
import { Download, Search, Users } from 'lucide-react'
import factwiseLogo from '../assets/logo192.png'

const EmployeeGrid: React.FC = () => {
  const gridRef = useRef<AgGridReact>(null)
  const [gridApi, setGridApi] = useState<GridApi | null>(null)
  const [searchText, setSearchText] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Get unique departments for filter dropdown
  const departments = useMemo(() => {
    const uniqueDepts = [...new Set(employeeData.map(emp => emp.department))]
    return ['All', ...uniqueDepts.sort()]
  }, [])

  // Memoized column definitions
  const columnDefs = useMemo<ColDef<Employee>[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 80,
        pinned: 'left',
        filter: 'agNumberColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true
      },
      {
        field: 'firstName',
        headerName: 'First Name',
        width: 120,
        pinned: 'left',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true
      },
      {
        field: 'lastName',
        headerName: 'Last Name',
        width: 120,
        pinned: 'left',
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 200,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true,
        cellRenderer: (params: any) => (
          <a
            href={`mailto:${params.value}`}
            className='text-blue-600 hover:text-blue-800 underline'
          >
            {params.value}
          </a>
        )
      },
      {
        field: 'department',
        headerName: 'Department',
        width: 130,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true
      },
      {
        field: 'position',
        headerName: 'Position',
        width: 180,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true
      },
      {
        field: 'salary',
        headerName: 'Salary',
        width: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true,
        valueFormatter: (params: any) => {
          return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).format(params.value)
        }
      },
      {
        field: 'hireDate',
        headerName: 'Hire Date',
        width: 120,
        filter: 'agDateColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true,
        filterParams: {
          browserDatePicker: true,
          minValidYear: 1900,
          maxValidYear: 2100,
          suppressClearButton: false,
          // Custom style for date picker
          pickerIcon: null
        },
        valueFormatter: (params: any) => {
          return new Date(params.value).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }
      },
      {
        field: 'age',
        headerName: 'Age',
        width: 80,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true
      },
      {
        field: 'location',
        headerName: 'Location',
        width: 120,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true
      },
      {
        field: 'performanceRating',
        headerName: 'Performance',
        width: 120,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true,
        valueFormatter: (params: any) => {
          return params.value?.toFixed(1)
        }
      },
      {
        field: 'projectsCompleted',
        headerName: 'Projects',
        width: 100,
        type: 'numericColumn',
        filter: 'agNumberColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true
      },
      {
        field: 'isActive',
        headerName: 'Status',
        width: 100,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true,
        valueFormatter: (params: any) => {
          return params.value ? 'Active' : 'Inactive'
        },
        cellClassRules: {
          'text-green-600 font-semibold': params => params.value === true,
          'text-red-600 font-semibold': params => params.value === false
        }
      },
      {
        field: 'skills',
        headerName: 'Skills',
        width: 200,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true,
        valueFormatter: (params: any) => {
          return Array.isArray(params.value) ? params.value.join(', ') : ''
        },
        tooltipField: 'skills',
        tooltipValueGetter: (params: any) => {
          return Array.isArray(params.value) ? params.value.join(', ') : ''
        }
      },
      {
        field: 'manager',
        headerName: 'Manager',
        width: 150,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        sortable: true,
        resizable: true,
        valueFormatter: (params: any) => {
          return params.value || 'None'
        }
      }
    ],
    []
  )

  // Grid options
  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true
    }),
    []
  )

  // Grid ready handler
  const onGridReady = useCallback((params: GridReadyEvent) => {
    setGridApi(params.api)
  }, [])

  // Filtered row data based on search and filters
  const filteredData = useMemo(() => {
    let data = employeeData

    // Department filter
    if (departmentFilter !== 'All') {
      data = data.filter(emp => emp.department === departmentFilter)
    }

    // Status filter
    if (statusFilter !== 'All') {
      const isActive = statusFilter === 'Active'
      data = data.filter(emp => emp.isActive === isActive)
    }

    // Global search
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase()
      data = data.filter(
        emp =>
          emp.firstName.toLowerCase().includes(searchLower) ||
          emp.lastName.toLowerCase().includes(searchLower) ||
          emp.email.toLowerCase().includes(searchLower) ||
          emp.department.toLowerCase().includes(searchLower) ||
          emp.position.toLowerCase().includes(searchLower) ||
          emp.location.toLowerCase().includes(searchLower) ||
          (emp.manager && emp.manager.toLowerCase().includes(searchLower)) ||
          emp.skills.some(skill => skill.toLowerCase().includes(searchLower))
      )
    }

    return data
  }, [searchText, departmentFilter, statusFilter])

  // Export to CSV
  const exportToCsv = useCallback(() => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: 'employee-data.csv',
        processCellCallback: params => {
          if (
            params.column.getColDef().field === 'skills' &&
            Array.isArray(params.value)
          ) {
            return params.value.join(', ')
          }
          if (params.column.getColDef().field === 'isActive') {
            return params.value ? 'Active' : 'Inactive'
          }
          if (params.column.getColDef().field === 'salary') {
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(params.value)
          }
          if (params.column.getColDef().field === 'hireDate') {
            return new Date(params.value).toLocaleDateString('en-US')
          }
          if (params.column.getColDef().field === 'performanceRating') {
            return params.value?.toFixed(1)
          }
          return params.value
        }
      })
    }
  }, [gridApi])

  return (
    <div className='w-full h-full p-6 bg-gradient-to-r from-blue-100 to-orange-100'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <img src='/logo192.png' alt='FactWise Logo' className='w-8 h-8' />
          <h1 className='text-3xl font-bold text-gray-900'>
            FactWise Employee Dashboard
          </h1>
        </div>
        <p className='text-gray-600'>
          Manage and analyze employee data with advanced filtering and export
          capabilities
        </p>
      </div>

      {/* Controls */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6'>
        <div className='flex flex-wrap gap-4 items-center'>
          {/* Global Search */}
          <div className='flex-1 min-w-64'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search employees...'
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Department Filter */}
          <div className='min-w-40'>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className='min-w-32'>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value='All'>All Status</option>
              <option value='Active'>Active</option>
              <option value='Inactive'>Inactive</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToCsv}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Download className='w-4 h-4' />
            Export CSV
          </button>
        </div>

        {/* Results Counter */}
        <div className='mt-3 text-sm text-gray-600'>
          Showing {filteredData.length} of {employeeData.length} employees
        </div>
      </div>

      {/* AG Grid */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='ag-theme-alpine h-[600px]'>
          <AgGridReact
            ref={gridRef}
            rowData={filteredData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            onGridReady={onGridReady}
            pagination={true}
            paginationPageSize={10}
            suppressCellFocus={false}
            rowSelection='multiple'
            suppressRowClickSelection={true}
            animateRows={true}
            rowHeight={50}
            headerHeight={50}
            floatingFiltersHeight={35}
            enableCellTextSelection={true}
            tooltipShowDelay={500}
            overlayLoadingTemplate={
              '<span class="ag-overlay-loading-center">Loading employee data...</span>'
            }
            overlayNoRowsTemplate={
              '<span class="ag-overlay-no-rows-center">No employees found matching your criteria</span>'
            }
          />
        </div>
      </div>
    </div>
  )
}

export default EmployeeGrid
