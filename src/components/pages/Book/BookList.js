import { Space, Button as AntButton, Tooltip, Modal, message, Image, Flex, Tag, Switch } from 'antd';
import React, { useState, useEffect } from 'react';
import { Card, Row, CardBody, Container } from "reactstrap";
import { Link } from 'react-router-dom';
import Iconify from "../../reusable/Iconify";
import { Col, } from "react-bootstrap";
import CustomTable from "../../reusable/CustomTable";
import Palette from "../../../utils/Palette";
import Book from 'models/BookModel';
import Category from 'models/CategoryModel';
import BookCategory from 'models/BookCategoryModel';
import Helper from 'utils/Helper';
import { create } from "zustand";

const useFilter = create((set) => ({
  search: "",
  categories: [],

  setSelectedCategories: (categories) =>
    set((state) => ({
      selectedCategories: categories,
    })),

  setSearch: (keyword) =>
    set((state) => ({
      search: keyword,
    })),
  resetFilters: () =>
    set((state) => ({
      filters: {
        category_id: {},
      },
      search: "",
    })),
}));

const BookList = () => {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);
  const [openBookModal, setOpenBookModal] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const search = useFilter((state) => state.search);
  const selectedCategories = useFilter((state) => state.selectedCategories);
  const setSelectedCategories = useFilter(
    (state) => state.setSelectedCategories
  );
  const setSearch = useFilter((state) => state.setSearch);

  const handleCategoryChange = (event) => {
    const { value } = event.target;
    setSelectedCategories(value);
    setPage(0); 
  };

  const columns = [
    {
      id: "image_cover",
      label: "Cover Image",
      filter: false,
      allowSort: false,
      render: (row) => {
        return (
          <Flex
            style={{
              height: "100px",
              width: "auto",
              aspectRatio: "3/4",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {!row?.image_cover ? (
              <Iconify
                icon={"material-symbols:hide-image-outline"}
                style={{
                  fontSize: "48px",
                }}
              />
            ) : (
              <Image
                height={"100%"}
                width={"100%"}
                style={{ objectFit: "contain" }}
                src={row?.image_cover}
              ></Image>
            )}
          </Flex>
        );
      },
    },
    {
      id: "title",
      label: "Title",
      filter: true,
      // render: (row) => (
      //   textToUppercase(row.title)
      // )
    },
    {
      id: "authors",
      label: "Authors",
      filter: true,
      render: (row) => (
        <Space wrap size={4} style={{ maxWidth: "200px" }}>
          {row?.book_authors && row?.book_authors?.length > 0
            ? row?.book_authors?.map((ba) => `- ${ba.authors.name}`)
            : "-"}
        </Space>
      ),
    },
    {
      id: "categories",
      label: "Categories",
      filter: true,
      allowSort: false,
      render: (row) => (
        <Space wrap size={4} style={{ maxWidth: "200px" }}>
          {row?.book_categories && row?.book_categories?.length > 0
            ? row?.book_categories?.map((bc) => <Tag>{bc.categories.name}</Tag>)
            : "-"}
        </Space>
      ),
    },
    {
      id: "highlight",
      label: "Highlight",
      filter: true,
      allowSort: true,
      render: (row) => (
        <Tooltip title="Highlight book per category">
          <Switch
            defaultValue={row?.highlight}
            onChange={(checked) => toggleField("highlight", checked, row?.id)}
          />
        </Tooltip>
      ),
    },
    {
      id: "hide",
      label: "Mark as Draft",
      filter: true,
      render: (row) => (
        <Tooltip title="Hide data on Landing Page">
          <Switch
            defaultValue={row?.hide}
            onChange={(checked) => toggleField('hide', checked, row?.id)}
          />
        </Tooltip>
      ),
    },
    {
      id: "",
      label: "",
      filter: false,
      render: (row) => {
        return (
          <>
            <Space size="small">
              <Tooltip title="Open on Landing Page">
                <AntButton
                  type={"link"}
                  style={{ color: Palette.MAIN_THEME }}
                  onClick={() => {
                    window.open(
                      `${Helper.redirectURL}books/details/${row?.id}`
                    );
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"mdi:external-link"} />}
                />
              </Tooltip>

              <Tooltip title="Detail">
                <Link to={`/books/${row.id}`}>
                  <AntButton
                    type={"link"}
                    style={{ color: Palette.MAIN_THEME }}
                    onClick={() => {
                      setOpenBookModal(true);
                      setSelectedBook(row);
                      setIsNewRecord(false);
                    }}
                    className={
                      "d-flex align-items-center justify-content-center"
                    }
                    shape="circle"
                    icon={<Iconify icon={"material-symbols:search-rounded"} />}
                  />
                </Link>
              </Tooltip>
              <Tooltip title="Edit">
                <Link to={`/books/${row.id}/edit`}>
                  <AntButton
                    type={"link"}
                    style={{ color: Palette.MAIN_THEME }}
                    onClick={() => {}}
                    className={
                      "d-flex align-items-center justify-content-center"
                    }
                    shape="circle"
                    icon={<Iconify icon={"material-symbols:edit"} />}
                  />
                </Link>
              </Tooltip>
              <Tooltip title="Delete">
                <AntButton
                  type={"link"}
                  style={{ color: Palette.MAIN_THEME }}
                  onClick={() => {
                    onDelete(row.id);
                  }}
                  className={"d-flex align-items-center justify-content-center"}
                  shape="circle"
                  icon={<Iconify icon={"material-symbols:delete-outline"} />}
                />
              </Tooltip>
            </Space>
          </>
        );
      },
    },
    /* {
      id: '', label: '', filter: false,
      render: ((row) => {
        return (
          <>
            <Button variant={'text'}>Lihat Detail</Button>
          </>
          )

      })
    }, */
  ];

  const deleteItem = async (id) => {
    try {
      await Book.delete(id);
      message.success("Book deleted");
      fetchData();
    } catch (e) {
      message.error("There was error from server");
      setLoading(true);
    }
  };

  const onDelete = (record) => {
    Modal.confirm({
      title: "Are you sure you want to delete this book data?",
      okText: "Yes",
      okType: "danger",
      onOk: () => {
        deleteItem(record);
      },
    });
  };

  const toggleField = async (field, checked, id) => {
    try {
      await Book.edit(id, { [field]: checked });
      // initializeData();
    } catch (e) {
      message.error(`Error updating book ${field}`);
    }
  };

  const initializeCategory = async () => {
    setCategoryLoading(true);
    try {
      let result = await Category.getAll();
    
      setCategory(result);
      setCategoryLoading(false);
    } catch (error) {
      setCategoryLoading(false);
      console.error('Error fetching categories:', error);
    }
  };

  const fetchData = async (currentPage = page, currentRowsPerPage = rowsPerPage) => {
    setLoading(true);
    try {
      let result = await Book.getAllWithFilter(
        selectedCategories || [],
        search || "",
        currentRowsPerPage,
        currentPage,
      );

      // console.log("result: ", result.meta);

      // Format the data
      let formattedResult = result.data.map((value) => {
        let bookAuthorsJoined = value.book_authors
          .map((book_author) => book_author.authors.name)
          .join(",");
        let bookCategoriesJoined = value.book_categories
          .map((book_category) => book_category.categories.name)
          .join(",");
        return {
          ...value,
          authors: bookAuthorsJoined,
          categories: bookCategoriesJoined,
        };
      });
      // console.log(formattedResult[0]?.book_authors?.length);
      setDataSource(formattedResult);
      setTotalCount(result.meta.meta.total_data)
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(0, rowsPerPage);
  }, [search]);

   useEffect(() => {
    fetchData(page, rowsPerPage);
  }, [page, rowsPerPage, selectedCategories]);

  useEffect(() => {
    initializeCategory();
    fetchData(0, rowsPerPage);
  }, []);

    const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (searchTerm) => {
    setSearch(searchTerm);
  };

  return (
    <>
      <Container fluid>
        <Card
          style={{ background: Palette.BACKGROUND_DARK_GRAY, color: "white" }}
          className="card-stats mb-4 mb-xl-0"
        >
          <CardBody>
            <Row>
              <Col className="mb-3" md={6}>
                <div style={{ fontWeight: "bold", fontSize: "1.1em" }}>
                  Books
                </div>
              </Col>
              <Col className="mb-3 text-right" md={6}>
                <Link to="/books/create">
                  <AntButton
                    onClick={() => {}}
                    size={"middle"}
                    type={"primary"}
                  >
                    Add Book
                  </AntButton>
                </Link>
              </Col>
            </Row>
            <Row></Row>
            <CustomTable
              showFilter={true}
              pagination={true}
              searchText={search}
              data={dataSource}
              columns={columns}
              onSearch={handleSearch}
              categoryFilter={selectedCategories}
              onCategoryChange={handleCategoryChange}
              categories={category}
              categoryLoading={categoryLoading} 
              // API Pagination Props
              apiPagination={true}
              totalCount={totalCount}
              currentPage={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </CardBody>
        </Card>
      </Container>

      {/* <BookFormModal
        isOpen={openBookModal}
        isNewRecord={isNewRecord}
        bookData={selectedBook}
        close={async (refresh) => {
          if (refresh) {
            await initializeData()
          }
          setOpenBookModal(false)
        }}
      /> */}
    </>
  );
};

export default BookList;
