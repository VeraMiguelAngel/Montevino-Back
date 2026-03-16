import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get()
  findAll() {
    return this.tablesService.findAll();
  }

  @Get('availability')
  getTablesAvailability(
    @Query('date') date: string,
    @Query('time') time: string,
  ) {
    return this.tablesService.getTablesAvailability(date, time);
  }
}
